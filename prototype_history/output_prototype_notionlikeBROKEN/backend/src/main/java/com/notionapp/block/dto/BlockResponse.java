package com.notionapp.block.dto;

import com.notionapp.block.BlockType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BlockResponse {

    private UUID id;
    private UUID pageId;
    private BlockType type;
    private String content;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}