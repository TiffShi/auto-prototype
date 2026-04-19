package com.notionapp.page.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PageResponse {

    private UUID id;
    private UUID userId;
    private UUID parentId;
    private String title;
    private String icon;
    private String coverUrl;
    private Integer orderIndex;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PageResponse> children;
    private boolean hasChildren;
}