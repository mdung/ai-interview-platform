package com.aiinterview.dto;

import com.aiinterview.model.Candidate;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkCandidateRequest {
    @NotEmpty
    private List<CandidateData> candidates;
    
    @Data
    public static class CandidateData {
        private String email;
        private String firstName;
        private String lastName;
        private String phoneNumber;
        private String linkedInUrl;
    }
}

