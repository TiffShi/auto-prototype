package com.instagram.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String imageUrl;
    private String caption;
    private LocalDateTime createdAt;
    private Long userId;
    private String username;
    private String userAvatarUrl;
    private long likeCount;
    private long commentCount;
    private boolean likedByCurrentUser;
}