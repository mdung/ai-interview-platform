package com.aiinterview.service;

import com.aiinterview.model.InterviewTemplate;
import com.aiinterview.repository.InterviewTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewTemplateService {
    
    private final InterviewTemplateRepository templateRepository;
    
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
}

