package com.aiinterview.controller;

import com.aiinterview.dto.TemplateListResponse;
import com.aiinterview.dto.TemplateUsageResponse;
import com.aiinterview.model.InterviewTemplate;
import com.aiinterview.service.InterviewTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter/templates")
@RequiredArgsConstructor
public class InterviewTemplateController {
    
    private final InterviewTemplateService templateService;
    
    @GetMapping
    public ResponseEntity<?> getAllTemplates(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        // If pagination parameters are provided, return paginated response
        if (page != null && size != null) {
            TemplateListResponse response = templateService.getAllTemplatesWithPagination(
                search, page, size, sortBy, sortDir
            );
            return ResponseEntity.ok(response);
        }
        
        // Otherwise, return simple list (backward compatibility)
        List<InterviewTemplate> templates = templateService.getAllActiveTemplates();
        return ResponseEntity.ok(templates);
    }
    
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<InterviewTemplate>> getTemplatesByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(templateService.getTemplatesByJobId(jobId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InterviewTemplate> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }
    
    @PostMapping
    public ResponseEntity<InterviewTemplate> createTemplate(@RequestBody InterviewTemplate template) {
        return ResponseEntity.ok(templateService.createTemplate(template));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InterviewTemplate> updateTemplate(@PathVariable Long id, @RequestBody InterviewTemplate template) {
        return ResponseEntity.ok(templateService.updateTemplate(id, template));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/usage")
    public ResponseEntity<TemplateUsageResponse> getTemplateUsage(@PathVariable Long id) {
        TemplateUsageResponse usage = templateService.getTemplateUsage(id);
        return ResponseEntity.ok(usage);
    }
    
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<InterviewTemplate> duplicateTemplate(@PathVariable Long id) {
        InterviewTemplate duplicate = templateService.duplicateTemplate(id);
        return ResponseEntity.ok(duplicate);
    }
    
    @PostMapping("/{id}/test")
    public ResponseEntity<String> testTemplate(@PathVariable Long id) {
        String result = templateService.testTemplate(id);
        return ResponseEntity.ok(result);
    }
}

