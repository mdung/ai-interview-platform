package com.aiinterview.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SuspiciousActivityRequest {
    private String activityType;
    private String timestamp;
    private Map<String, Object> metadata;
}

