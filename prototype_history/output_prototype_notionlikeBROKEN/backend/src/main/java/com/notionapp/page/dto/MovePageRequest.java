package com.notionapp.page.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class MovePageRequest {

    private UUID parentId; // null means move to root
}