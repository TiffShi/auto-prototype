package com.notionapp.block;

import com.notionapp.block.dto.BlockRequest;
import com.notionapp.block.dto.BlockResponse;
import com.notionapp.block.dto.ReorderRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    @GetMapping("/api/pages/{pageId}/blocks")
    public ResponseEntity<List<BlockResponse>> getBlocksForPage(
            @PathVariable UUID pageId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(blockService.getBlocksForPage(pageId, userDetails.getUsername()));
    }

    @PostMapping("/api/pages/{pageId}/blocks")
    public ResponseEntity<BlockResponse> createBlock(
            @PathVariable UUID pageId,
            @RequestBody BlockRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(blockService.createBlock(pageId, request, userDetails.getUsername()));
    }

    @PutMapping("/api/blocks/{id}")
    public ResponseEntity<BlockResponse> updateBlock(
            @PathVariable UUID id,
            @RequestBody BlockRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(blockService.updateBlock(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/api/blocks/{id}")
    public ResponseEntity<Void> deleteBlock(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        blockService.deleteBlock(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/pages/{pageId}/blocks/reorder")
    public ResponseEntity<List<BlockResponse>> reorderBlocks(
            @PathVariable UUID pageId,
            @RequestBody ReorderRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(blockService.reorderBlocks(pageId, request, userDetails.getUsername()));
    }
}