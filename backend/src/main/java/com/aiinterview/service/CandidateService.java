package com.aiinterview.service;

import com.aiinterview.dto.*;
import com.aiinterview.model.Candidate;
import com.aiinterview.repository.CandidateRepository;
import com.aiinterview.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {
    
    private final CandidateRepository candidateRepository;
    private final InterviewSessionRepository sessionRepository;
    
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }
    
    public CandidateListResponse getAllCandidatesWithPagination(
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Candidate> candidatePage;
        if (search != null && !search.trim().isEmpty()) {
            candidatePage = candidateRepository.findWithSearch(search, pageable);
        } else {
            candidatePage = candidateRepository.findAll(pageable);
        }
        
        return CandidateListResponse.builder()
            .candidates(candidatePage.getContent())
            .totalElements(candidatePage.getTotalElements())
            .totalPages(candidatePage.getTotalPages())
            .currentPage(page)
            .pageSize(size)
            .build();
    }
    
    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }
    
    @Transactional
    public Candidate createCandidate(Candidate candidate) {
        return candidateRepository.save(candidate);
    }
    
    @Transactional
    public Candidate updateCandidate(Long id, Candidate candidateDetails) {
        Candidate candidate = getCandidateById(id);
        candidate.setFirstName(candidateDetails.getFirstName());
        candidate.setLastName(candidateDetails.getLastName());
        candidate.setEmail(candidateDetails.getEmail());
        candidate.setPhoneNumber(candidateDetails.getPhoneNumber());
        candidate.setResumeUrl(candidateDetails.getResumeUrl());
        candidate.setLinkedInUrl(candidateDetails.getLinkedInUrl());
        return candidateRepository.save(candidate);
    }
    
    @Transactional
    public List<Candidate> bulkCreateCandidates(BulkCandidateRequest request) {
        return request.getCandidates().stream()
            .map(data -> {
                Candidate candidate = new Candidate();
                candidate.setEmail(data.getEmail());
                candidate.setFirstName(data.getFirstName());
                candidate.setLastName(data.getLastName());
                candidate.setPhoneNumber(data.getPhoneNumber());
                candidate.setLinkedInUrl(data.getLinkedInUrl());
                return candidateRepository.save(candidate);
            })
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void bulkDeleteCandidates(List<Long> candidateIds) {
        candidateRepository.deleteAllById(candidateIds);
    }
    
    @Transactional
    public void deleteCandidate(Long id) {
        Candidate candidate = getCandidateById(id);
        candidateRepository.delete(candidate);
    }
    
    public List<com.aiinterview.dto.InterviewSessionResponse> getCandidateInterviews(Long candidateId) {
        // Verify candidate exists
        getCandidateById(candidateId);
        
        // Get all sessions for this candidate
        List<com.aiinterview.model.InterviewSession> sessions = sessionRepository.findByCandidate_Id(candidateId);
        
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
    
    public CandidateStatisticsResponse getCandidateStatistics() {
        long totalCandidates = candidateRepository.count();
        long candidatesWithResumes = candidateRepository.findAll().stream()
            .filter(c -> c.getResumeUrl() != null && !c.getResumeUrl().isEmpty())
            .count();
        long candidatesWithInterviews = sessionRepository.findAll().stream()
            .map(s -> s.getCandidate().getId())
            .distinct()
            .count();
        
        long totalInterviews = sessionRepository.count();
        double averageInterviewsPerCandidate = totalCandidates > 0 
            ? (double) totalInterviews / totalCandidates 
            : 0.0;
        
        return CandidateStatisticsResponse.builder()
            .totalCandidates(totalCandidates)
            .candidatesWithResumes(candidatesWithResumes)
            .candidatesWithInterviews(candidatesWithInterviews)
            .activeCandidates(totalCandidates) // All candidates are considered active
            .averageInterviewsPerCandidate(averageInterviewsPerCandidate)
            .build();
    }
}

