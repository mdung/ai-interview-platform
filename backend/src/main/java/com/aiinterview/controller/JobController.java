package com.aiinterview.controller;

import com.aiinterview.dto.JobListResponse;
import com.aiinterview.dto.JobStatisticsResponse;
import com.aiinterview.model.Job;
import com.aiinterview.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter/jobs")
@RequiredArgsConstructor
public class JobController {
    
    private final JobService jobService;
    
    @GetMapping
    public ResponseEntity<JobListResponse> getAllJobs(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        JobListResponse response = jobService.getAllJobsWithPagination(
            search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }
    
    @GetMapping("/{id}/candidates")
    public ResponseEntity<List<com.aiinterview.dto.InterviewSessionResponse>> getJobCandidates(@PathVariable Long id) {
        List<com.aiinterview.dto.InterviewSessionResponse> candidates = jobService.getJobCandidates(id);
        return ResponseEntity.ok(candidates);
    }
    
    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        return ResponseEntity.ok(jobService.createJob(job));
    }
    
    @PostMapping("/bulk")
    public ResponseEntity<List<Job>> bulkCreateJobs(@RequestBody List<Job> jobs) {
        List<Job> createdJobs = jobService.bulkCreateJobs(jobs);
        return ResponseEntity.ok(createdJobs);
    }
    
    @DeleteMapping("/bulk")
    public ResponseEntity<Void> bulkDeleteJobs(@RequestBody List<Long> jobIds) {
        jobService.bulkDeleteJobs(jobIds);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job job) {
        return ResponseEntity.ok(jobService.updateJob(id, job));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<JobStatisticsResponse> getJobStatistics() {
        JobStatisticsResponse statistics = jobService.getJobStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/{id}/statistics")
    public ResponseEntity<JobStatisticsResponse> getJobStatisticsById(@PathVariable Long id) {
        JobStatisticsResponse statistics = jobService.getJobStatisticsById(id);
        return ResponseEntity.ok(statistics);
    }
    
    @PostMapping("/{id}/publish")
    public ResponseEntity<Job> publishJob(@PathVariable Long id) {
        Job job = jobService.publishJob(id);
        return ResponseEntity.ok(job);
    }
    
    @PostMapping("/{id}/unpublish")
    public ResponseEntity<Job> unpublishJob(@PathVariable Long id) {
        Job job = jobService.unpublishJob(id);
        return ResponseEntity.ok(job);
    }
}

