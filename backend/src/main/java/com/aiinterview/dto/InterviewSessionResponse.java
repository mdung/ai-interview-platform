package com.aiinterview.dto;

import com.aiinterview.model.InterviewSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionResponse {
    private Long id;
    private String sessionId;
    private Long candidateId;
    private String candidateName;
    private Long templateId;
    private String templateName;
    private InterviewSession.SessionStatus status;
    private String language;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String aiSummary;
    private String strengths;
    private String weaknesses;
    private InterviewSession.Recommendation recommendation;
    private Integer totalTurns;
}

