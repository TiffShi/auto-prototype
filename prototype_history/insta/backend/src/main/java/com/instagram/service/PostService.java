package com.instagram.service;

import com.instagram.dto.PostDTO;
import com.instagram.exception.BadRequestException;
import com.instagram.exception.ResourceNotFoundException;
import com.instagram.exception.UnauthorizedException;
import com.instagram.model.Like;
import com.instagram.model.Post;
import com.instagram.model.User;
import com.instagram.repository.CommentRepository;
import com.instagram.repository.LikeRepository;
import com.instagram.repository.PostRepository;
import com.instagram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Transactional
    public PostDTO createPost(MultipartFile image, String caption, String currentUsername) {
        if (image == null || image.isEmpty()) {
            throw new BadRequestException("Image is required");
        }

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        String imageUrl = fileStorageService.storeFile(image);

        Post post = Post.builder()
                .imageUrl(imageUrl)
                .caption(caption)
                .user(user)
                .build();

        Post savedPost = postRepository.save(post);
        log.info("Created post {} by user {}", savedPost.getId(), currentUsername);

        return mapToPostDTO(savedPost, user);
    }

    @Transactional(readOnly = true)
    public PostDTO getPostById(Long postId, String currentUsername) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }

        return mapToPostDTO(post, currentUser);
    }

    @Transactional(readOnly = true)
    public List<PostDTO> getFeedPosts(String currentUsername, int page, int size) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findFeedPostsForUser(currentUser.getId(), pageable);

        return posts.getContent().stream()
                .map(post -> mapToPostDTO(post, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostDTO> getExplorePosts(String currentUsername, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);

        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }

        final User finalCurrentUser = currentUser;
        return posts.getContent().stream()
                .map(post -> mapToPostDTO(post, finalCurrentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostDTO> getUserPosts(String username, String currentUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }

        final User finalCurrentUser = currentUser;
        return postRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(post -> mapToPostDTO(post, finalCurrentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long postId, String currentUsername) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        if (!post.getUser().getUsername().equals(currentUsername)) {
            throw new UnauthorizedException("You can only delete your own posts");
        }

        fileStorageService.deleteFile(post.getImageUrl());
        postRepository.delete(post);
        log.info("Deleted post {} by user {}", postId, currentUsername);
    }

    @Transactional
    public PostDTO likePost(Long postId, String currentUsername) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        if (likeRepository.existsByUserAndPost(currentUser, post)) {
            throw new BadRequestException("You have already liked this post");
        }

        Like like = Like.builder()
                .user(currentUser)
                .post(post)
                .build();

        likeRepository.save(like);

        if (!post.getUser().getId().equals(currentUser.getId())) {
            notificationService.createLikeNotification(currentUser, post);
        }

        log.info("User {} liked post {}", currentUsername, postId);
        return mapToPostDTO(post, currentUser);
    }

    @Transactional
    public PostDTO unlikePost(Long postId, String currentUsername) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        Like like = likeRepository.findByUserAndPost(currentUser, post)
                .orElseThrow(() -> new BadRequestException("You have not liked this post"));

        likeRepository.delete(like);
        log.info("User {} unliked post {}", currentUsername, postId);
        return mapToPostDTO(post, currentUser);
    }

    public PostDTO mapToPostDTO(Post post, User currentUser) {
        long likeCount = likeRepository.countByPost(post);
        long commentCount = commentRepository.countByPost(post);

        boolean likedByCurrentUser = false;
        if (currentUser != null) {
            likedByCurrentUser = likeRepository.existsByUserAndPost(currentUser, post);
        }

        return PostDTO.builder()
                .id(post.getId())
                .imageUrl(post.getImageUrl())
                .caption(post.getCaption())
                .createdAt(post.getCreatedAt())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .userAvatarUrl(post.getUser().getAvatarUrl())
                .likeCount(likeCount)
                .commentCount(commentCount)
                .likedByCurrentUser(likedByCurrentUser)
                .build();
    }
}