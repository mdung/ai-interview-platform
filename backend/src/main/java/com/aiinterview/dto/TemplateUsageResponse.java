package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateUsageResponse {
    private Long templateId;
    private String templateName;
    private Long totalSessions;
    private Long completedSessions;
    private Long inProgressSessions;
    private Long pendingSessions;
    private Double averageCompletionRate;
    private Double averageTurnsPerSession;
    private Map<String, Long> sessionsByStatus;
    private Long uniqueCandidates;
}


