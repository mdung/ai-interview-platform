package com.aiinterview.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportQueueService {
    
    private final ReportService reportService;
    
    /**
     * Generate dashboard report asynchronously
     */
    @Async("reportExecutor")
    public CompletableFuture<byte[]> generateDashboardReportAsync() {
        try {
            log.info("Generating dashboard report asynchronously");
            byte[] pdfBytes = reportService.generateDashboardReport();
            log.info("Dashboard report generated successfully");
            return CompletableFuture.completedFuture(pdfBytes);
        } catch (IOException e) {
            log.error("Failed to generate dashboard report", e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    /**
     * Generate interview analytics report asynchronously
     */
    @Async("reportExecutor")
    public CompletableFuture<byte[]> generateInterviewReportAsync() {
        try {
            log.info("Generating interview analytics report asynchronously");
            byte[] pdfBytes = reportService.generateInterviewAnalyticsReport();
            log.info("Interview analytics report generated successfully");
            return CompletableFuture.completedFuture(pdfBytes);
        } catch (IOException e) {
            log.error("Failed to generate interview analytics report", e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    /**
     * Generate candidate analytics report asynchronously
     */
    @Async("reportExecutor")
    public CompletableFuture<byte[]> generateCandidateReportAsync() {
        try {
            log.info("Generating candidate analytics report asynchronously");
            byte[] pdfBytes = reportService.generateCandidateAnalyticsReport();
            log.info("Candidate analytics report generated successfully");
            return CompletableFuture.completedFuture(pdfBytes);
        } catch (IOException e) {
            log.error("Failed to generate candidate analytics report", e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    /**
     * Generate dashboard report CSV asynchronously
     */
    @Async("reportExecutor")
    public CompletableFuture<String> generateDashboardReportCsvAsync() {
        try {
            log.info("Generating dashboard report CSV asynchronously");
            String csv = reportService.generateDashboardReportCsv();
            log.info("Dashboard report CSV generated successfully");
            return CompletableFuture.completedFuture(csv);
        } catch (Exception e) {
            log.error("Failed to generate dashboard report CSV", e);
            return CompletableFuture.failedFuture(e);
        }
    }
}


