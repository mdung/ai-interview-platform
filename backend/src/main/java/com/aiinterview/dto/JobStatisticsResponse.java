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
public class JobStatisticsResponse {
    private long totalJobs;
    private long activeJobs;
    private long totalCandidates;
    private long totalInterviews;
    private Map<String, Long> jobsBySeniorityLevel;
    private double averageInterviewsPerJob;
}

