package com.aiinterview.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AiServiceClient {
    
    @Value("${ai-service.url}")
    private String aiServiceUrl;
    
    private final RestTemplate restTemplate;
    
    public void notifySessionUpdate(String sessionId, Object data) {
        // This would be called by the AI service to update session
        // For now, it's a placeholder
    }
}

