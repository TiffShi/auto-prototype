package com.notionapp.page;

import com.notionapp.page.dto.MovePageRequest;
import com.notionapp.page.dto.PageRequest;
import com.notionapp.page.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pages")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    @GetMapping
    public ResponseEntity<List<PageResponse>> getRootPages(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(pageService.getRootPages(userDetails.getUsername()));
    }

    @GetMapping("/trash")
    public ResponseEntity<List<PageResponse>> getTrashedPages(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(pageService.getTrashedPages(userDetails.getUsername()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PageResponse>> searchPages(
            @RequestParam("q") String query,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(pageService.searchPages(query, userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PageResponse> getPage(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(pageService.getPage(id, userDetails.getUsername()));
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<List<PageResponse>> getChildPages(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(pageService.getChildPages(id, userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<PageResponse> createPage(
            @RequestBody PageRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pageService.createPage(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PageResponse> updatePage(
            @PathVariable UUID id,
            @RequestBody PageRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(pageService.updatePage(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePage(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        pageService.deletePage(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<PageResponse> movePage(
            @PathVariable UUID id,
            @RequestBody MovePageRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(pageService.movePage(id, request, userDetails.getUsername()));
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<PageResponse> restorePage(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(pageService.restorePage(id, userDetails.getUsername()));
    }
}