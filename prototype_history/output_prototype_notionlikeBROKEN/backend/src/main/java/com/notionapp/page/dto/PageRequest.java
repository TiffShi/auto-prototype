package com.notionapp.page.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class PageRequest {

    private String title;
    private String icon;
    private String coverUrl;
    private UUID parentId;
}