package com.example.post.repository;

import com.example.post.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    @Query("SELECT v.post.id FROM Comment v WHERE v.createdBy = :userId")
    Page<Long> findCommentedPostIdsByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(v.id) from Comment v where v.createdBy = :userId")
    long countByUserId(@Param("userId") Long userId);
}
