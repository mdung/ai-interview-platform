package com.aiinterview.controller;

import com.aiinterview.dto.ATSIntegrationRequest;
import com.aiinterview.dto.ATSIntegrationResponse;
import com.aiinterview.service.ATSService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats")
@RequiredArgsConstructor
public class ATSController {
    
    private final ATSService atsService;
    
    @PostMapping("/integrate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<ATSIntegrationResponse> integrateATS(
            @Valid @RequestBody ATSIntegrationRequest request) {
        ATSIntegrationResponse response = atsService.integrateATS(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/integrations")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<List<ATSIntegrationResponse>> getIntegrations() {
        List<ATSIntegrationResponse> integrations = atsService.getAllIntegrations();
        return ResponseEntity.ok(integrations);
    }
    
    @GetMapping("/integrations/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<ATSIntegrationResponse> getIntegration(@PathVariable Long id) {
        ATSIntegrationResponse integration = atsService.getIntegrationById(id);
        return ResponseEntity.ok(integration);
    }
    
    @PutMapping("/integrations/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<ATSIntegrationResponse> updateIntegration(
            @PathVariable Long id,
            @Valid @RequestBody ATSIntegrationRequest request) {
        ATSIntegrationResponse response = atsService.updateIntegration(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/integrations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteIntegration(@PathVariable Long id) {
        atsService.deleteIntegration(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/integrations/{id}/sync")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<ATSIntegrationResponse> syncWithATS(@PathVariable Long id) {
        ATSIntegrationResponse response = atsService.syncWithATS(id);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/candidates/{candidateId}/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Void> exportCandidateToATS(
            @PathVariable Long candidateId,
            @RequestParam Long integrationId) {
        atsService.exportCandidateToATS(candidateId, integrationId);
        return ResponseEntity.ok().build();
    }
}



