package com.instagram.service;

import com.instagram.dto.UpdateProfileRequest;
import com.instagram.dto.UserDTO;
import com.instagram.exception.BadRequestException;
import com.instagram.exception.ResourceNotFoundException;
import com.instagram.exception.UnauthorizedException;
import com.instagram.model.Follow;
import com.instagram.model.User;
import com.instagram.repository.FollowRepository;
import com.instagram.repository.PostRepository;
import com.instagram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public UserDTO getUserByUsername(String username, String currentUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }

        return mapToUserDTO(user, currentUser);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id, String currentUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }

        return mapToUserDTO(user, currentUser);
    }

    @Transactional
    public UserDTO updateProfile(Long userId, UpdateProfileRequest request,
                                  MultipartFile avatarFile, String currentUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.getUsername().equals(currentUsername)) {
            throw new UnauthorizedException("You can only update your own profile");
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (avatarFile != null && !avatarFile.isEmpty()) {
            if (user.getAvatarUrl() != null) {
                fileStorageService.deleteFile(user.getAvatarUrl());
            }
            String avatarUrl = fileStorageService.storeFile(avatarFile);
            user.setAvatarUrl(avatarUrl);
        } else if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);
        log.info("Updated profile for user: {}", updatedUser.getUsername());

        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        return mapToUserDTO(updatedUser, currentUser);
    }

    @Transactional
    public void followUser(Long targetUserId, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        if (currentUser.getId().equals(targetUserId)) {
            throw new BadRequestException("You cannot follow yourself");
        }

        if (followRepository.existsByFollowerAndFollowing(currentUser, targetUser)) {
            throw new BadRequestException("You are already following this user");
        }

        Follow follow = Follow.builder()
                .follower(currentUser)
                .following(targetUser)
                .build();

        followRepository.save(follow);
        notificationService.createFollowNotification(currentUser, targetUser);
        log.info("User {} followed user {}", currentUser.getUsername(), targetUser.getUsername());
    }

    @Transactional
    public void unfollowUser(Long targetUserId, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        Follow follow = followRepository.findByFollowerAndFollowing(currentUser, targetUser)
                .orElseThrow(() -> new BadRequestException("You are not following this user"));

        followRepository.delete(follow);
        log.info("User {} unfollowed user {}", currentUser.getUsername(), targetUser.getUsername());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> searchUsers(String query, String currentUsername) {
        List<User> users = userRepository.searchByUsername(query);
        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }

        final User finalCurrentUser = currentUser;
        return users.stream()
                .map(user -> mapToUserDTO(user, finalCurrentUser))
                .collect(Collectors.toList());
    }

    public UserDTO mapToUserDTO(User user, User currentUser) {
        long followerCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);
        long postCount = postRepository.countByUser(user);

        boolean isFollowing = false;
        if (currentUser != null && !currentUser.getId().equals(user.getId())) {
            isFollowing = followRepository.existsByFollowerAndFollowing(currentUser, user);
        }

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .followerCount(followerCount)
                .followingCount(followingCount)
                .postCount(postCount)
                .isFollowing(isFollowing)
                .createdAt(user.getCreatedAt())
                .build();
    }
}