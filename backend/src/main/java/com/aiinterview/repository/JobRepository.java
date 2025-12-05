package com.aiinterview.repository;

import com.aiinterview.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByActiveTrue();
    List<Job> findByCreatedBy_Id(Long userId);
    
    Page<Job> findByActiveTrue(Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.active = true AND " +
           "(:search IS NULL OR " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Job> findActiveWithSearch(@Param("search") String search, Pageable pageable);
}

