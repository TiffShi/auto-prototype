package com.notionapp.page;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PageRepository extends JpaRepository<Page, UUID> {

    // Root pages (no parent) for a user, not deleted
    List<Page> findByUserIdAndParentIsNullAndIsDeletedFalseOrderByOrderIndexAsc(UUID userId);

    // Child pages for a given parent, not deleted
    List<Page> findByUserIdAndParentIdAndIsDeletedFalseOrderByOrderIndexAsc(UUID userId, UUID parentId);

    // Trashed pages for a user
    List<Page> findByUserIdAndIsDeletedTrueOrderByUpdatedAtDesc(UUID userId);

    // Find by id and user (ownership check)
    Optional<Page> findByIdAndUserId(UUID id, UUID userId);

    // Full-text search on title
    @Query("SELECT p FROM Page p WHERE p.user.id = :userId AND p.isDeleted = false " +
           "AND LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY p.updatedAt DESC")
    List<Page> searchByTitle(@Param("userId") UUID userId, @Param("query") String query);

    // Count children for ordering
    @Query("SELECT COUNT(p) FROM Page p WHERE p.parent.id = :parentId AND p.isDeleted = false")
    long countByParentId(@Param("parentId") UUID parentId);

    // Count root pages for ordering
    @Query("SELECT COUNT(p) FROM Page p WHERE p.user.id = :userId AND p.parent IS NULL AND p.isDeleted = false")
    long countRootPagesByUserId(@Param("userId") UUID userId);
}