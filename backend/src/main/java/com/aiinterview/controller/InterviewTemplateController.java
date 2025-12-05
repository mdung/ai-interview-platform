package com.aiinterview.controller;

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
    public ResponseEntity<List<InterviewTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllActiveTemplates());
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
}

