package com.instagram.controller;

import com.instagram.dto.PostDTO;
import com.instagram.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/feed")
    public ResponseEntity<List<PostDTO>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<PostDTO> posts = postService.getFeedPosts(userDetails.getUsername(), page, size);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/explore")
    public ResponseEntity<List<PostDTO>> getExplore(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        String currentUsername = userDetails != null ? userDetails.getUsername() : null;
        List<PostDTO> posts = postService.getExplorePosts(currentUsername, page, size);
        return ResponseEntity.ok(posts);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<PostDTO> createPost(
            @RequestPart("image") MultipartFile image,
            @RequestPart(value = "caption", required = false) String caption,
            @AuthenticationPrincipal UserDetails userDetails) {
        PostDTO post = postService.createPost(image, caption, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String currentUsername = userDetails != null ? userDetails.getUsername() : null;
        PostDTO post = postService.getPostById(id, currentUsername);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        postService.deletePost(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<PostDTO> likePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        PostDTO post = postService.likePost(id, userDetails.getUsername());
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<PostDTO> unlikePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        PostDTO post = postService.unlikePost(id, userDetails.getUsername());
        return ResponseEntity.ok(post);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<PostDTO>> getUserPosts(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        String currentUsername = userDetails != null ? userDetails.getUsername() : null;
        List<PostDTO> posts = postService.getUserPosts(username, currentUsername);
        return ResponseEntity.ok(posts);
    }
}