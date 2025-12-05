package com.aiinterview.repository;

import com.aiinterview.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    Optional<InterviewSession> findBySessionId(String sessionId);
    List<InterviewSession> findByCandidate_Id(Long candidateId);
    List<InterviewSession> findByStatus(InterviewSession.SessionStatus status);
}

