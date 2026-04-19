package com.notionapp.block.dto;

import com.notionapp.block.BlockType;
import lombok.Data;

@Data
public class BlockRequest {

    private BlockType type;
    private String content;
    private Integer orderIndex;
}