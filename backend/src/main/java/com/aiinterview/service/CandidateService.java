package com.aiinterview.service;

import com.aiinterview.model.Candidate;
import com.aiinterview.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateService {
    
    private final CandidateRepository candidateRepository;
    
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
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
}

