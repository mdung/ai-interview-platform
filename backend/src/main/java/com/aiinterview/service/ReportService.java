package com.aiinterview.service;

import com.aiinterview.dto.*;
import com.aiinterview.repository.CandidateRepository;
import com.aiinterview.repository.InterviewSessionRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReportService {
    
    private final AnalyticsService analyticsService;
    
    public byte[] generateDashboardReport() throws IOException {
        DashboardStatisticsResponse stats = analyticsService.getDashboardStatistics();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Title
        document.add(new Paragraph("Dashboard Statistics Report")
            .setFontSize(20)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER));
        
        document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
            .setFontSize(10)
            .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("\n"));
        
        // Overview
        document.add(new Paragraph("Overview")
            .setFontSize(16)
            .setBold());
        document.add(new Paragraph("Total Candidates: " + stats.getTotalCandidates()));
        document.add(new Paragraph("Total Jobs: " + stats.getTotalJobs()));
        document.add(new Paragraph("Total Interviews: " + stats.getTotalInterviews()));
        document.add(new Paragraph("Completion Rate: " + String.format("%.2f%%", stats.getCompletionRate())));
        document.add(new Paragraph("Average Interview Duration: " + String.format("%.2f minutes", stats.getAverageInterviewDuration())));
        document.add(new Paragraph("\n"));
        
        // Status Breakdown
        document.add(new Paragraph("Interview Status Breakdown")
            .setFontSize(16)
            .setBold());
        if (stats.getInterviewsByStatus() != null) {
            stats.getInterviewsByStatus().forEach((status, count) -> {
                document.add(new Paragraph(status + ": " + count));
            });
        }
        document.add(new Paragraph("\n"));
        
        document.close();
        return baos.toByteArray();
    }
    
    public byte[] generateInterviewAnalyticsReport() throws IOException {
        InterviewAnalyticsResponse analytics = analyticsService.getInterviewAnalytics();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        document.add(new Paragraph("Interview Analytics Report")
            .setFontSize(20)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER));
        
        document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
            .setFontSize(10)
            .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("\n"));
        
        document.add(new Paragraph("Summary")
            .setFontSize(16)
            .setBold());
        document.add(new Paragraph("Total Interviews: " + analytics.getTotalInterviews()));
        document.add(new Paragraph("Completed: " + analytics.getCompletedInterviews()));
        document.add(new Paragraph("In Progress: " + analytics.getInProgressInterviews()));
        document.add(new Paragraph("Abandoned: " + analytics.getAbandonedInterviews()));
        document.add(new Paragraph("Average Completion Rate: " + String.format("%.2f%%", analytics.getAverageCompletionRate())));
        document.add(new Paragraph("Average Duration: " + String.format("%.2f minutes", analytics.getAverageInterviewDuration())));
        document.add(new Paragraph("Average Turns: " + String.format("%.2f", analytics.getAverageTurnsPerInterview())));
        document.add(new Paragraph("\n"));
        
        // Average Scores
        document.add(new Paragraph("Average Scores")
            .setFontSize(16)
            .setBold());
        if (analytics.getAverageScoresByCategory() != null) {
            analytics.getAverageScoresByCategory().forEach((category, score) -> {
                document.add(new Paragraph(category + ": " + String.format("%.2f/10", score)));
            });
        }
        document.add(new Paragraph("\n"));
        
        document.close();
        return baos.toByteArray();
    }
    
    public byte[] generateCandidateAnalyticsReport() throws IOException {
        CandidateAnalyticsResponse analytics = analyticsService.getCandidateAnalytics();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        document.add(new Paragraph("Candidate Analytics Report")
            .setFontSize(20)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER));
        
        document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
            .setFontSize(10)
            .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("\n"));
        
        document.add(new Paragraph("Summary")
            .setFontSize(16)
            .setBold());
        document.add(new Paragraph("Total Candidates: " + analytics.getTotalCandidates()));
        document.add(new Paragraph("Candidates with Interviews: " + analytics.getCandidatesWithInterviews()));
        document.add(new Paragraph("Candidates with Resumes: " + analytics.getCandidatesWithResumes()));
        document.add(new Paragraph("Average Interviews per Candidate: " + String.format("%.2f", analytics.getAverageInterviewsPerCandidate())));
        document.add(new Paragraph("Average Score: " + String.format("%.2f/10", analytics.getAverageScore())));
        document.add(new Paragraph("\n"));
        
        // Top Performers
        document.add(new Paragraph("Top Performers")
            .setFontSize(16)
            .setBold());
        if (analytics.getTopPerformers() != null) {
            analytics.getTopPerformers().forEach(performer -> {
                document.add(new Paragraph(performer.getCandidateName() + 
                    " - Score: " + String.format("%.2f", performer.getAverageScore()) + 
                    " - Recommendation: " + performer.getRecommendation()));
            });
        }
        document.add(new Paragraph("\n"));
        
        document.close();
        return baos.toByteArray();
    }
    
    public String generateDashboardReportCsv() {
        DashboardStatisticsResponse stats = analyticsService.getDashboardStatistics();
        
        StringBuilder csv = new StringBuilder();
        csv.append("Metric,Value\n");
        csv.append("Total Candidates,").append(stats.getTotalCandidates()).append("\n");
        csv.append("Total Jobs,").append(stats.getTotalJobs()).append("\n");
        csv.append("Total Interviews,").append(stats.getTotalInterviews()).append("\n");
        csv.append("Completion Rate,").append(String.format("%.2f%%", stats.getCompletionRate())).append("\n");
        csv.append("Average Interview Duration,").append(String.format("%.2f", stats.getAverageInterviewDuration())).append("\n");
        
        return csv.toString();
    }
}

