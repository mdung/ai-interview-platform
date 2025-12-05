package com.aiinterview.controller;

import com.aiinterview.dto.*;
import com.aiinterview.service.AnalyticsService;
import com.aiinterview.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/recruiter/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    private final ReportService reportService;
    
    @GetMapping("/overview")
    public ResponseEntity<DashboardStatisticsResponse> getDashboardOverview() {
        DashboardStatisticsResponse stats = analyticsService.getDashboardStatistics();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/interviews")
    public ResponseEntity<InterviewAnalyticsResponse> getInterviewAnalytics() {
        InterviewAnalyticsResponse analytics = analyticsService.getInterviewAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/candidates")
    public ResponseEntity<CandidateAnalyticsResponse> getCandidateAnalytics() {
        CandidateAnalyticsResponse analytics = analyticsService.getCandidateAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/trends")
    public ResponseEntity<TrendAnalysisResponse> getTrendAnalysis(
            @RequestParam(defaultValue = "interviews") String metric,
            @RequestParam(defaultValue = "daily") String period,
            @RequestParam(defaultValue = "30") int days) {
        TrendAnalysisResponse trends = analyticsService.getTrendAnalysis(metric, period, days);
        return ResponseEntity.ok(trends);
    }
    
    @GetMapping("/reports/dashboard/pdf")
    public ResponseEntity<byte[]> generateDashboardReportPdf() throws IOException {
        byte[] pdfBytes = reportService.generateDashboardReport();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "dashboard_report.pdf");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(pdfBytes);
    }
    
    @GetMapping("/reports/dashboard/csv")
    public ResponseEntity<String> generateDashboardReportCsv() {
        String csv = reportService.generateDashboardReportCsv();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "dashboard_report.csv");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(csv);
    }
    
    @GetMapping("/reports/interviews/pdf")
    public ResponseEntity<byte[]> generateInterviewReportPdf() throws IOException {
        byte[] pdfBytes = reportService.generateInterviewAnalyticsReport();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "interview_analytics_report.pdf");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(pdfBytes);
    }
    
    @GetMapping("/reports/candidates/pdf")
    public ResponseEntity<byte[]> generateCandidateReportPdf() throws IOException {
        byte[] pdfBytes = reportService.generateCandidateAnalyticsReport();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "candidate_analytics_report.pdf");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(pdfBytes);
    }
}

