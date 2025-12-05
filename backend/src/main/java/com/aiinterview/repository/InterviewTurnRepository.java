package com.aiinterview.repository;

import com.aiinterview.model.InterviewTurn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewTurnRepository extends JpaRepository<InterviewTurn, Long> {
    List<InterviewTurn> findBySession_IdOrderByTurnNumberAsc(Long sessionId);
}

