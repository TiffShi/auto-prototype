package com.notionapp.block;

import com.notionapp.block.dto.BlockRequest;
import com.notionapp.block.dto.BlockResponse;
import com.notionapp.block.dto.ReorderRequest;
import com.notionapp.exception.ResourceNotFoundException;
import com.notionapp.page.Page;
import com.notionapp.page.PageRepository;
import com.notionapp.user.User;
import com.notionapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BlockService {

    private final BlockRepository blockRepository;
    private final PageRepository pageRepository;
    private final UserService userService;

    public List<BlockResponse> getBlocksForPage(UUID pageId, String email) {
        User user = userService.findByEmail(email);
        Page page = pageRepository.findByIdAndUserId(pageId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

        return blockRepository.findByPageIdOrderByOrderIndexAsc(page.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BlockResponse createBlock(UUID pageId, BlockRequest request, String email) {
        User user = userService.findByEmail(email);
        Page page = pageRepository.findByIdAndUserId(pageId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

        int orderIndex = request.getOrderIndex() != null
                ? request.getOrderIndex()
                : (int) blockRepository.countByPageId(pageId);

        Block block = Block.builder()
                .page(page)
                .type(request.getType() != null ? request.getType() : BlockType.TEXT)
                .content(request.getContent() != null ? request.getContent() : "")
                .orderIndex(orderIndex)
                .build();

        Block saved = blockRepository.save(block);
        return toResponse(saved);
    }

    public BlockResponse updateBlock(UUID blockId, BlockRequest request, String email) {
        User user = userService.findByEmail(email);
        Block block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found: " + blockId));

        // Verify ownership via page
        pageRepository.findByIdAndUserId(block.getPage().getId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found or access denied"));

        if (request.getType() != null) {
            block.setType(request.getType());
        }
        if (request.getContent() != null) {
            block.setContent(request.getContent());
        }
        if (request.getOrderIndex() != null) {
            block.setOrderIndex(request.getOrderIndex());
        }

        Block saved = blockRepository.save(block);
        return toResponse(saved);
    }

    public void deleteBlock(UUID blockId, String email) {
        User user = userService.findByEmail(email);
        Block block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found: " + blockId));

        // Verify ownership via page
        pageRepository.findByIdAndUserId(block.getPage().getId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found or access denied"));

        blockRepository.delete(block);
    }

    public List<BlockResponse> reorderBlocks(UUID pageId, ReorderRequest request, String email) {
        User user = userService.findByEmail(email);
        pageRepository.findByIdAndUserId(pageId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

        List<Block> blocks = blockRepository.findByPageIdOrderByOrderIndexAsc(pageId);
        Map<UUID, Block> blockMap = blocks.stream()
                .collect(Collectors.toMap(Block::getId, Function.identity()));

        for (ReorderRequest.BlockOrderItem item : request.getBlocks()) {
            Block block = blockMap.get(item.getId());
            if (block != null) {
                block.setOrderIndex(item.getOrderIndex());
                blockRepository.save(block);
            }
        }

        return blockRepository.findByPageIdOrderByOrderIndexAsc(pageId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private BlockResponse toResponse(Block block) {
        return BlockResponse.builder()
                .id(block.getId())
                .pageId(block.getPage().getId())
                .type(block.getType())
                .content(block.getContent())
                .orderIndex(block.getOrderIndex())
                .createdAt(block.getCreatedAt())
                .updatedAt(block.getUpdatedAt())
                .build();
    }
}