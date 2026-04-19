package com.notionapp.block.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ReorderRequest {

    private List<BlockOrderItem> blocks;

    @Data
    public static class BlockOrderItem {
        private UUID id;
        private Integer orderIndex;
    }
}