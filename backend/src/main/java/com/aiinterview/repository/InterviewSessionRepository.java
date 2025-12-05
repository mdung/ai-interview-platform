package com.aiinterview.repository;

import com.aiinterview.model.InterviewSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    Optional<InterviewSession> findBySessionId(String sessionId);
    List<InterviewSession> findByCandidate_Id(Long candidateId);
    List<InterviewSession> findByStatus(InterviewSession.SessionStatus status);
    
    Page<InterviewSession> findByStatus(InterviewSession.SessionStatus status, Pageable pageable);
    Page<InterviewSession> findByCandidate_Id(Long candidateId, Pageable pageable);
    
    @Query("SELECT s FROM InterviewSession s WHERE " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:candidateId IS NULL OR s.candidate.id = :candidateId) AND " +
           "(:templateId IS NULL OR s.template.id = :templateId) AND " +
           "(:startDate IS NULL OR s.startedAt >= :startDate) AND " +
           "(:endDate IS NULL OR s.startedAt <= :endDate)")
    Page<InterviewSession> findWithFilters(
        @Param("status") InterviewSession.SessionStatus status,
        @Param("candidateId") Long candidateId,
        @Param("templateId") Long templateId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}

