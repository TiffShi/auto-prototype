package com.instagram.repository;

import com.instagram.model.Post;
import com.instagram.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUserOrderByCreatedAtDesc(User user);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user IN " +
           "(SELECT f.following FROM Follow f WHERE f.follower.id = :userId) " +
           "OR p.user.id = :userId " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findFeedPostsForUser(@Param("userId") Long userId, Pageable pageable);

    long countByUser(User user);
}