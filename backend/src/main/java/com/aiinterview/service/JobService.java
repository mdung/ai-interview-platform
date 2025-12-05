package com.aiinterview.service;

import com.aiinterview.model.Job;
import com.aiinterview.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {
    
    private final JobRepository jobRepository;
    
    public List<Job> getAllActiveJobs() {
        return jobRepository.findByActiveTrue();
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
}

