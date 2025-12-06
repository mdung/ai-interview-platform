package com.aiinterview.repository;

import com.aiinterview.model.InterviewSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long>, JpaSpecificationExecutor<InterviewSession> {
    Optional<InterviewSession> findBySessionId(String sessionId);
    List<InterviewSession> findByCandidate_Id(Long candidateId);
    List<InterviewSession> findByStatus(InterviewSession.SessionStatus status);
    
    Page<InterviewSession> findByStatus(InterviewSession.SessionStatus status, Pageable pageable);
    Page<InterviewSession> findByCandidate_Id(Long candidateId, Pageable pageable);
}

