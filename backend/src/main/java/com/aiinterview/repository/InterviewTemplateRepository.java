package com.aiinterview.repository;

import com.aiinterview.model.InterviewTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewTemplateRepository extends JpaRepository<InterviewTemplate, Long> {
    List<InterviewTemplate> findByActiveTrue();
    List<InterviewTemplate> findByJob_Id(Long jobId);
}

