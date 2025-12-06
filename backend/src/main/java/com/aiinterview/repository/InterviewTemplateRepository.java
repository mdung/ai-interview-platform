package com.aiinterview.repository;

import com.aiinterview.model.InterviewTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewTemplateRepository extends JpaRepository<InterviewTemplate, Long> {
    List<InterviewTemplate> findByActiveTrue();
    List<InterviewTemplate> findByJob_Id(Long jobId);
    Page<InterviewTemplate> findByActiveTrue(Pageable pageable);
    
    @Query("SELECT t FROM InterviewTemplate t WHERE t.active = true AND " +
           "(LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.systemPrompt) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<InterviewTemplate> findActiveWithSearch(@Param("search") String search, Pageable pageable);
}

