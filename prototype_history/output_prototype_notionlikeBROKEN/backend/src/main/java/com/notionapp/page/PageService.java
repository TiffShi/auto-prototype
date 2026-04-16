package com.notionapp.page;

import com.notionapp.exception.ResourceNotFoundException;
import com.notionapp.exception.UnauthorizedException;
import com.notionapp.page.dto.MovePageRequest;
import com.notionapp.page.dto.PageRequest;
import com.notionapp.page.dto.PageResponse;
import com.notionapp.user.User;
import com.notionapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PageService {

    private final PageRepository pageRepository;
    private final UserService userService;

    public List<PageResponse> getRootPages(String email) {
        User user = userService.findByEmail(email);
        List<Page> pages = pageRepository
                .findByUserIdAndParentIsNullAndIsDeletedFalseOrderByOrderIndexAsc(user.getId());
        return pages.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PageResponse getPage(UUID pageId, String email) {
        User user = userService.findByEmail(email);
        Page page = pageRepository.findByIdAndUserId(pageId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));
        return toResponseWithChildren(page);
    }

    public PageResponse createPage(PageRequest request, String email) {
        User user = userService.findByEmail(email);

        Page parent = null;
        int orderIndex = 0;

        if (request.getParentId() != null) {
            parent = pageRepository.findByIdAndUserId(request.getParentId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent page not found"));
            orderIndex = (int) pageRepository.countByParentId(request.getParentId());
        } else {
            orderIndex = (int) pageRepository.countRootPagesByUserId(user.getId());
        }

        Page page = Page.builder()
                .user(user)
                .parent(parent)
                .title(request.getTitle() != null ? request.getTitle() : "Untitled")
                .icon(request.getIcon())
                .coverUrl(request.getCoverUrl())
                .orderIndex(orderIndex)
                .isDeleted(false)
                .build();

        Page saved = pageRepository.save(page);
        return toResponse(saved);
    }

    public PageResponse updatePage(UUID pageId, PageRequest request, String email) {
        User user = userService.findByEmail(email);
        Page page = pageRepository.findByIdAndUserId(pageId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

        if (request.getTitle() != null) {
            page.setTitle(request.getTitle());
        }
        if (request.getIcon() != null) {
            page.setIcon(request.getIcon());
        }
        if (request.getCoverUrl() != null) {
            page.setCoverUrl(request.getCoverUrl());
        }

        Page saved = pageRepository.save(page);
        return toResponse(saved);
    }

    public void deletePage(UUID pageId, String email) {
        User user = userService.findByEmail(email);
        Page page = pageRepository.findByIdAndUserId(pageId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

        softDeleteRecursive(page);
    }

    private void softDeleteRecursive(Page page) {
        page.setIsDeleted(true);
        pageRepository.save(page);
        for (Page child : page.getChildren()) {
            softDeleteRecursive(child);
        }
    }

    public List<PageResponse> getChildPages(UUID pageId, String email) {
        User user = userService.findByEmail(email);
        // Verify ownership
        pageRepository.findByIdAndUserId(pageId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

        List<Page> children = pageRepository
                .findByUserIdAndParentIdAndIsDeletedFalseOrderByOrderIndexAsc(user.getId(), pageId);
        return children.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PageResponse movePage(UUID pageId, MovePageRequest request, String email) {
        User user = userService.findByEmail(email);
        Page page = pageRepository.findByIdAndUserId(pageId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

        if (request.getParentId() != null) {
            // Prevent circular reference
            if (request.getParentId().equals(pageId)) {
                throw new IllegalArgumentException("Page cannot be its own parent");
            }
            Page newParent = pageRepository.findByIdAndUserId(request.getParentId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent page not found"));
            page.setParent(newParent);
            page.setOrderIndex((int) pageRepository.countByParentId(request.getParentId()));
        } else {
            page.setParent(null);
            page.setOrderIndex((int) pageRepository.countRootPagesByUserId(user.getId()));
        }

        Page saved = pageRepository.save(page);
        return toResponse(saved);
    }

    public List<PageResponse> getTrashedPages(String email) {
        User user = userService.findByEmail(email);
        List<Page> pages = pageRepository.findByUserIdAndIsDeletedTrueOrderByUpdatedAtDesc(user.getId());
        return pages.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PageResponse restorePage(UUID pageId, String email) {
        User user = userService.findByEmail(email);
        Page page = pageRepository.findByIdAndUserId(pageId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

        page.setIsDeleted(false);
        // If parent is deleted, move to root
        if (page.getParent() != null && page.getParent().getIsDeleted()) {
            page.setParent(null);
            page.setOrderIndex((int) pageRepository.countRootPagesByUserId(user.getId()));
        }

        Page saved = pageRepository.save(page);
        return toResponse(saved);
    }

    public List<PageResponse> searchPages(String query, String email) {
        User user = userService.findByEmail(email);
        List<Page> pages = pageRepository.searchByTitle(user.getId(), query);
        return pages.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private PageResponse toResponse(Page page) {
        return PageResponse.builder()
                .id(page.getId())
                .userId(page.getUser().getId())
                .parentId(page.getParent() != null ? page.getParent().getId() : null)
                .title(page.getTitle())
                .icon(page.getIcon())
                .coverUrl(page.getCoverUrl())
                .orderIndex(page.getOrderIndex())
                .isDeleted(page.getIsDeleted())
                .createdAt(page.getCreatedAt())
                .updatedAt(page.getUpdatedAt())
                .hasChildren(!page.getChildren().isEmpty())
                .build();
    }

    private PageResponse toResponseWithChildren(Page page) {
        List<PageResponse> childResponses = page.getChildren().stream()
                .filter(c -> !c.getIsDeleted())
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.builder()
                .id(page.getId())
                .userId(page.getUser().getId())
                .parentId(page.getParent() != null ? page.getParent().getId() : null)
                .title(page.getTitle())
                .icon(page.getIcon())
                .coverUrl(page.getCoverUrl())
                .orderIndex(page.getOrderIndex())
                .isDeleted(page.getIsDeleted())
                .createdAt(page.getCreatedAt())
                .updatedAt(page.getUpdatedAt())
                .children(childResponses)
                .hasChildren(!childResponses.isEmpty())
                .build();
    }
}