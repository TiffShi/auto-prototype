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
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private String avatarUrl;
    private long followerCount;
    private long followingCount;
    private long postCount;
    private boolean isFollowing;
    private LocalDateTime createdAt;
}