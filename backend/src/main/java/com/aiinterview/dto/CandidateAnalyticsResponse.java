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
public class CandidateAnalyticsResponse {
    private long totalCandidates;
    private long candidatesWithInterviews;
    private long candidatesWithResumes;
    private double averageInterviewsPerCandidate;
    private double averageScore;
    private Map<String, Long> candidatesByRecommendation;
    private Map<String, Long> candidatesByMonth;
    private List<CandidatePerformanceData> topPerformers;
    private List<CandidatePerformanceData> needsAttention;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidatePerformanceData {
        private Long candidateId;
        private String candidateName;
        private long interviewCount;
        private double averageScore;
        private String recommendation;
    }
}

