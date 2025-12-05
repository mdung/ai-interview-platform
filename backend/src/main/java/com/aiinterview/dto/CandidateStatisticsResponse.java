package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateStatisticsResponse {
    private long totalCandidates;
    private long candidatesWithResumes;
    private long candidatesWithInterviews;
    private long activeCandidates;
    private double averageInterviewsPerCandidate;
}

