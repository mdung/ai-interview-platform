package com.aiinterview.service;

import com.aiinterview.dto.JobListResponse;
import com.aiinterview.dto.JobStatisticsResponse;
import com.aiinterview.model.Job;
import com.aiinterview.repository.JobRepository;
import com.aiinterview.repository.InterviewSessionRepository;
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
public class JobService {
    
    private final JobRepository jobRepository;
    private final InterviewSessionRepository sessionRepository;
    
    public List<Job> getAllActiveJobs() {
        return jobRepository.findByActiveTrue();
    }
    
    public JobListResponse getAllJobsWithPagination(
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Job> jobPage;
        if (search != null && !search.trim().isEmpty()) {
            jobPage = jobRepository.findActiveWithSearch(search, pageable);
        } else {
            jobPage = jobRepository.findByActiveTrue(pageable);
        }
        
        return JobListResponse.builder()
            .jobs(jobPage.getContent())
            .totalElements(jobPage.getTotalElements())
            .totalPages(jobPage.getTotalPages())
            .currentPage(page)
            .pageSize(size)
            .build();
    }
    
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Job not found"));
    }
    
    @Transactional
    public Job createJob(Job job) {
        return jobRepository.save(job);
    }
    
    @Transactional
    public List<Job> bulkCreateJobs(List<Job> jobs) {
        return jobs.stream()
            .map(jobRepository::save)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void bulkDeleteJobs(List<Long> jobIds) {
        List<Job> jobs = jobRepository.findAllById(jobIds);
        jobs.forEach(job -> job.setActive(false));
        jobRepository.saveAll(jobs);
    }
    
    @Transactional
    public Job updateJob(Long id, Job jobDetails) {
        Job job = getJobById(id);
        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setSeniorityLevel(jobDetails.getSeniorityLevel());
        job.setRequiredSkills(jobDetails.getRequiredSkills());
        job.setSoftSkills(jobDetails.getSoftSkills());
        return jobRepository.save(job);
    }
    
    @Transactional
    public void deleteJob(Long id) {
        Job job = getJobById(id);
        job.setActive(false);
        jobRepository.save(job);
    }
    
    public JobStatisticsResponse getJobStatistics() {
        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.findByActiveTrue().size();
        
        long totalCandidates = sessionRepository.findAll().stream()
            .map(s -> s.getCandidate().getId())
            .distinct()
            .count();
        
        long totalInterviews = sessionRepository.count();
        
        Map<String, Long> jobsBySeniority = jobRepository.findByActiveTrue().stream()
            .collect(Collectors.groupingBy(
                job -> job.getSeniorityLevel().name(),
                Collectors.counting()
            ));
        
        double averageInterviewsPerJob = activeJobs > 0 
            ? (double) totalInterviews / activeJobs 
            : 0.0;
        
        return JobStatisticsResponse.builder()
            .totalJobs(totalJobs)
            .activeJobs(activeJobs)
            .totalCandidates(totalCandidates)
            .totalInterviews(totalInterviews)
            .jobsBySeniorityLevel(jobsBySeniority)
            .averageInterviewsPerJob(averageInterviewsPerJob)
            .build();
    }
    
    public JobStatisticsResponse getJobStatisticsById(Long jobId) {
        Job job = getJobById(jobId);
        
        // Get all sessions for this job (through templates)
        List<com.aiinterview.model.InterviewSession> jobSessions = sessionRepository.findAll().stream()
            .filter(session -> session.getTemplate().getJob() != null && 
                             session.getTemplate().getJob().getId().equals(jobId))
            .collect(Collectors.toList());
        
        long totalCandidates = jobSessions.stream()
            .map(s -> s.getCandidate().getId())
            .distinct()
            .count();
        
        long totalInterviews = jobSessions.size();
        
        double averageInterviewsPerJob = totalCandidates > 0 
            ? (double) totalInterviews / totalCandidates 
            : 0.0;
        
        Map<String, Long> jobsBySeniority = new HashMap<>();
        jobsBySeniority.put(job.getSeniorityLevel().name(), 1L);
        
        return JobStatisticsResponse.builder()
            .totalJobs(1L)
            .activeJobs(job.getActive() ? 1L : 0L)
            .totalCandidates(totalCandidates)
            .totalInterviews(totalInterviews)
            .jobsBySeniorityLevel(jobsBySeniority)
            .averageInterviewsPerJob(averageInterviewsPerJob)
            .build();
    }
    
    public List<com.aiinterview.dto.InterviewSessionResponse> getJobCandidates(Long jobId) {
        // Verify job exists
        getJobById(jobId);
        
        // Get all sessions for this job (through templates)
        List<com.aiinterview.model.InterviewSession> sessions = sessionRepository.findAll().stream()
            .filter(session -> session.getTemplate().getJob() != null && 
                             session.getTemplate().getJob().getId().equals(jobId))
            .collect(Collectors.toList());
        
        // Map to response DTOs
        return sessions.stream()
            .map(session -> {
                return com.aiinterview.dto.InterviewSessionResponse.builder()
                    .id(session.getId())
                    .sessionId(session.getSessionId())
                    .candidateId(session.getCandidate().getId())
                    .candidateName(session.getCandidate().getFirstName() + " " + session.getCandidate().getLastName())
                    .templateId(session.getTemplate().getId())
                    .templateName(session.getTemplate().getName())
                    .status(session.getStatus())
                    .language(session.getLanguage())
                    .startedAt(session.getStartedAt())
                    .completedAt(session.getCompletedAt())
                    .aiSummary(session.getAiSummary())
                    .strengths(session.getStrengths())
                    .weaknesses(session.getWeaknesses())
                    .recommendation(session.getRecommendation())
                    .totalTurns(session.getTotalTurns())
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    @Transactional
    public Job publishJob(Long id) {
        Job job = getJobById(id);
        job.setActive(true);
        return jobRepository.save(job);
    }
    
    @Transactional
    public Job unpublishJob(Long id) {
        Job job = getJobById(id);
        job.setActive(false);
        return jobRepository.save(job);
    }
}

