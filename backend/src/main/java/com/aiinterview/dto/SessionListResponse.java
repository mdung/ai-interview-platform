package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionListResponse {
    private List<InterviewSessionResponse> sessions;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}

