package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAnalyticsResponse {
    private long totalInterviews;
    private long completedInterviews;
    private long inProgressInterviews;
    private long abandonedInterviews;
    private double averageCompletionRate;
    private double averageInterviewDuration;
    private double averageTurnsPerInterview;
    private Map<String, Long> interviewsByStatus;
    private Map<String, Long> interviewsByTemplate;
    private Map<String, Double> averageScoresByCategory;
    private List<InterviewTrendData> trends;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewTrendData {
        private String date;
        private long count;
        private double averageScore;
    }
}

