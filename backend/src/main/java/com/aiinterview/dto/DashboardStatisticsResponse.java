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
public class DashboardStatisticsResponse {
    private long totalCandidates;
    private long totalJobs;
    private long totalInterviews;
    private long activeInterviews;
    private long completedInterviews;
    private long pendingInterviews;
    private double completionRate;
    private double averageInterviewDuration;
    private Map<String, Long> interviewsByStatus;
    private Map<String, Long> interviewsByDay;
    private Map<String, Long> candidatesByMonth;
}

