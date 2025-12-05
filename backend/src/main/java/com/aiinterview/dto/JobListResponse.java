package com.aiinterview.dto;

import com.aiinterview.model.Job;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobListResponse {
    private List<Job> jobs;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}

