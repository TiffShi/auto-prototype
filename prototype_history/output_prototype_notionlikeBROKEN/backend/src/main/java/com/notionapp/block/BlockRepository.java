package com.notionapp.block;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlockRepository extends JpaRepository<Block, UUID> {

    List<Block> findByPageIdOrderByOrderIndexAsc(UUID pageId);

    Optional<Block> findByIdAndPageId(UUID id, UUID pageId);

    @Query("SELECT COUNT(b) FROM Block b WHERE b.page.id = :pageId")
    long countByPageId(@Param("pageId") UUID pageId);

    void deleteByPageId(UUID pageId);
}