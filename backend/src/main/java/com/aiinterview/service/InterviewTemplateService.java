package com.aiinterview.service;

import com.aiinterview.dto.TemplateListResponse;
import com.aiinterview.dto.TemplateUsageResponse;
import com.aiinterview.model.InterviewSession;
import com.aiinterview.model.InterviewTemplate;
import com.aiinterview.repository.InterviewSessionRepository;
import com.aiinterview.repository.InterviewTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewTemplateService {
    
    private final InterviewTemplateRepository templateRepository;
    private final InterviewSessionRepository sessionRepository;
    
    public List<InterviewTemplate> getAllActiveTemplates() {
        return templateRepository.findByActiveTrue();
    }
    
    public InterviewTemplate getTemplateById(Long id) {
        return templateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Template not found"));
    }
    
    public List<InterviewTemplate> getTemplatesByJobId(Long jobId) {
        return templateRepository.findByJob_Id(jobId);
    }
    
    @Transactional
    public InterviewTemplate createTemplate(InterviewTemplate template) {
        return templateRepository.save(template);
    }
    
    @Transactional
    public InterviewTemplate updateTemplate(Long id, InterviewTemplate templateDetails) {
        InterviewTemplate template = getTemplateById(id);
        template.setName(templateDetails.getName());
        template.setMode(templateDetails.getMode());
        template.setSystemPrompt(templateDetails.getSystemPrompt());
        template.setQuestionBank(templateDetails.getQuestionBank());
        template.setEstimatedDurationMinutes(templateDetails.getEstimatedDurationMinutes());
        return templateRepository.save(template);
    }
    
    @Transactional
    public void deleteTemplate(Long id) {
        InterviewTemplate template = getTemplateById(id);
        template.setActive(false);
        templateRepository.save(template);
    }
    
    public TemplateListResponse getAllTemplatesWithPagination(
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<InterviewTemplate> templatePage;
        if (search != null && !search.trim().isEmpty()) {
            templatePage = templateRepository.findActiveWithSearch(search, pageable);
        } else {
            templatePage = templateRepository.findByActiveTrue(pageable);
        }
        
        return TemplateListResponse.builder()
            .templates(templatePage.getContent())
            .totalElements(templatePage.getTotalElements())
            .totalPages(templatePage.getTotalPages())
            .currentPage(page)
            .pageSize(size)
            .build();
    }
    
    public TemplateUsageResponse getTemplateUsage(Long templateId) {
        InterviewTemplate template = getTemplateById(templateId);
        
        // Get all sessions using this template
        List<InterviewSession> sessions = sessionRepository.findAll().stream()
            .filter(s -> s.getTemplate().getId().equals(templateId))
            .collect(Collectors.toList());
        
        long totalSessions = sessions.size();
        long completedSessions = sessions.stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.COMPLETED)
            .count();
        long inProgressSessions = sessions.stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.IN_PROGRESS)
            .count();
        long pendingSessions = sessions.stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.PENDING)
            .count();
        
        double averageCompletionRate = totalSessions > 0 
            ? (double) completedSessions / totalSessions * 100 
            : 0.0;
        
        double averageTurnsPerSession = totalSessions > 0
            ? sessions.stream()
                .mapToInt(s -> s.getTotalTurns() != null ? s.getTotalTurns() : 0)
                .average()
                .orElse(0.0)
            : 0.0;
        
        Map<String, Long> sessionsByStatus = new HashMap<>();
        sessionsByStatus.put("COMPLETED", completedSessions);
        sessionsByStatus.put("IN_PROGRESS", inProgressSessions);
        sessionsByStatus.put("PENDING", pendingSessions);
        sessionsByStatus.put("PAUSED", sessions.stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.PAUSED)
            .count());
        sessionsByStatus.put("ABANDONED", sessions.stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.ABANDONED)
            .count());
        
        long uniqueCandidates = sessions.stream()
            .map(s -> s.getCandidate().getId())
            .distinct()
            .count();
        
        return TemplateUsageResponse.builder()
            .templateId(templateId)
            .templateName(template.getName())
            .totalSessions(totalSessions)
            .completedSessions(completedSessions)
            .inProgressSessions(inProgressSessions)
            .pendingSessions(pendingSessions)
            .averageCompletionRate(averageCompletionRate)
            .averageTurnsPerSession(averageTurnsPerSession)
            .sessionsByStatus(sessionsByStatus)
            .uniqueCandidates(uniqueCandidates)
            .build();
    }
    
    @Transactional
    public InterviewTemplate duplicateTemplate(Long templateId) {
        InterviewTemplate original = getTemplateById(templateId);
        
        InterviewTemplate duplicate = InterviewTemplate.builder()
            .name(original.getName() + " (Copy)")
            .job(original.getJob())
            .mode(original.getMode())
            .systemPrompt(original.getSystemPrompt())
            .questionBank(original.getQuestionBank() != null 
                ? new java.util.ArrayList<>(original.getQuestionBank()) 
                : new java.util.ArrayList<>())
            .estimatedDurationMinutes(original.getEstimatedDurationMinutes())
            .createdBy(original.getCreatedBy())
            .active(true)
            .build();
        
        return templateRepository.save(duplicate);
    }
    
    @Transactional
    public String testTemplate(Long templateId) {
        InterviewTemplate template = getTemplateById(templateId);
        
        // Validate template structure
        StringBuilder validationResults = new StringBuilder();
        
        if (template.getName() == null || template.getName().trim().isEmpty()) {
            validationResults.append("Template name is required. ");
        }
        
        if (template.getSystemPrompt() == null || template.getSystemPrompt().trim().isEmpty()) {
            validationResults.append("System prompt is required. ");
        }
        
        if (template.getQuestionBank() == null || template.getQuestionBank().isEmpty()) {
            validationResults.append("Question bank is empty. ");
        }
        
        if (template.getEstimatedDurationMinutes() == null || template.getEstimatedDurationMinutes() <= 0) {
            validationResults.append("Estimated duration must be greater than 0. ");
        }
        
        if (validationResults.length() == 0) {
            return "Template validation passed. Template is ready to use.";
        } else {
            return "Template validation failed: " + validationResults.toString();
        }
    }
}

