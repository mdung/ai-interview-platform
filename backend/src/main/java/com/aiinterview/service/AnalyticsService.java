package com.aiinterview.service;

import com.aiinterview.dto.*;
import com.aiinterview.model.InterviewSession;
import com.aiinterview.model.InterviewTurn;
import com.aiinterview.model.InterviewSession;
import com.aiinterview.model.InterviewTurn;
import com.aiinterview.repository.CandidateRepository;
import com.aiinterview.repository.InterviewSessionRepository;
import com.aiinterview.repository.InterviewTurnRepository;
import com.aiinterview.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    
    private final InterviewSessionRepository sessionRepository;
    private final InterviewTurnRepository turnRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    
    public DashboardStatisticsResponse getDashboardStatistics() {
        long totalCandidates = candidateRepository.count();
        long totalJobs = jobRepository.count();
        long totalInterviews = sessionRepository.count();
        
        long activeInterviews = sessionRepository.findByStatus(InterviewSession.SessionStatus.IN_PROGRESS).size();
        long completedInterviews = sessionRepository.findByStatus(InterviewSession.SessionStatus.COMPLETED).size();
        long pendingInterviews = sessionRepository.findByStatus(InterviewSession.SessionStatus.PENDING).size();
        
        double completionRate = totalInterviews > 0 
            ? (double) completedInterviews / totalInterviews * 100 
            : 0.0;
        
        // Calculate average interview duration
        List<InterviewSession> completedSessions = sessionRepository.findByStatus(InterviewSession.SessionStatus.COMPLETED);
        double averageDuration = completedSessions.stream()
            .filter(s -> s.getStartedAt() != null && s.getCompletedAt() != null)
            .mapToLong(s -> java.time.Duration.between(s.getStartedAt(), s.getCompletedAt()).toMinutes())
            .average()
            .orElse(0.0);
        
        // Interviews by status
        Map<String, Long> interviewsByStatus = sessionRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                s -> s.getStatus().name(),
                Collectors.counting()
            ));
        
        // Interviews by day (last 7 days)
        Map<String, Long> interviewsByDay = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long count = sessionRepository.findAll().stream()
                .filter(s -> s.getStartedAt() != null && 
                    s.getStartedAt().toLocalDate().equals(date))
                .count();
            interviewsByDay.put(date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")), count);
        }
        
        // Candidates by month (last 6 months)
        Map<String, Long> candidatesByMonth = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            String monthKey = monthStart.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            long count = candidateRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && 
                    c.getCreatedAt().toLocalDate().isAfter(monthStart.minusDays(1)) &&
                    c.getCreatedAt().toLocalDate().isBefore(monthStart.plusMonths(1)))
                .count();
            candidatesByMonth.put(monthKey, count);
        }
        
        return DashboardStatisticsResponse.builder()
            .totalCandidates(totalCandidates)
            .totalJobs(totalJobs)
            .totalInterviews(totalInterviews)
            .activeInterviews(activeInterviews)
            .completedInterviews(completedInterviews)
            .pendingInterviews(pendingInterviews)
            .completionRate(completionRate)
            .averageInterviewDuration(averageDuration)
            .interviewsByStatus(interviewsByStatus)
            .interviewsByDay(interviewsByDay)
            .candidatesByMonth(candidatesByMonth)
            .build();
    }
    
    public InterviewAnalyticsResponse getInterviewAnalytics() {
        List<InterviewSession> allSessions = sessionRepository.findAll();
        long totalInterviews = allSessions.size();
        long completedInterviews = allSessions.stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.COMPLETED)
            .count();
        long inProgressInterviews = allSessions.stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.IN_PROGRESS)
            .count();
        long abandonedInterviews = allSessions.stream()
            .filter(s -> s.getStatus() == InterviewSession.SessionStatus.ABANDONED)
            .count();
        
        double averageCompletionRate = totalInterviews > 0 
            ? (double) completedInterviews / totalInterviews * 100 
            : 0.0;
        
        // Average interview duration
        double averageDuration = allSessions.stream()
            .filter(s -> s.getStartedAt() != null && s.getCompletedAt() != null)
            .mapToLong(s -> java.time.Duration.between(s.getStartedAt(), s.getCompletedAt()).toMinutes())
            .average()
            .orElse(0.0);
        
        // Average turns per interview
        double averageTurns = allSessions.stream()
            .mapToInt(InterviewSession::getTotalTurns)
            .average()
            .orElse(0.0);
        
        // Interviews by status
        Map<String, Long> interviewsByStatus = allSessions.stream()
            .collect(Collectors.groupingBy(
                s -> s.getStatus().name(),
                Collectors.counting()
            ));
        
        // Interviews by template
        Map<String, Long> interviewsByTemplate = allSessions.stream()
            .collect(Collectors.groupingBy(
                s -> s.getTemplate().getName(),
                Collectors.counting()
            ));
        
        // Average scores by category
        Map<String, Double> averageScores = new HashMap<>();
        List<InterviewTurn> allTurns = turnRepository.findAll();
        
        double avgCommunication = allTurns.stream()
            .filter(t -> t.getCommunicationScore() != null)
            .mapToDouble(InterviewTurn::getCommunicationScore)
            .average()
            .orElse(0.0);
        averageScores.put("communication", avgCommunication);
        
        double avgTechnical = allTurns.stream()
            .filter(t -> t.getTechnicalScore() != null)
            .mapToDouble(InterviewTurn::getTechnicalScore)
            .average()
            .orElse(0.0);
        averageScores.put("technical", avgTechnical);
        
        double avgClarity = allTurns.stream()
            .filter(t -> t.getClarityScore() != null)
            .mapToDouble(InterviewTurn::getClarityScore)
            .average()
            .orElse(0.0);
        averageScores.put("clarity", avgClarity);
        
        // Trends (last 30 days)
        List<InterviewAnalyticsResponse.InterviewTrendData> trends = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long count = allSessions.stream()
                .filter(s -> s.getStartedAt() != null && 
                    s.getStartedAt().toLocalDate().equals(date))
                .count();
            
            double avgScore = allSessions.stream()
                .filter(s -> s.getStartedAt() != null && 
                    s.getStartedAt().toLocalDate().equals(date) &&
                    s.getStatus() == InterviewSession.SessionStatus.COMPLETED)
                .mapToDouble(s -> {
                    // Calculate average score from turns
                    List<InterviewTurn> sessionTurns = turnRepository.findBySession_IdOrderByTurnNumberAsc(s.getId());
                    return sessionTurns.stream()
                        .filter(t -> t.getTechnicalScore() != null)
                        .mapToDouble(InterviewTurn::getTechnicalScore)
                        .average()
                        .orElse(0.0);
                })
                .average()
                .orElse(0.0);
            
            trends.add(InterviewAnalyticsResponse.InterviewTrendData.builder()
                .date(date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                .count(count)
                .averageScore(avgScore)
                .build());
        }
        
        return InterviewAnalyticsResponse.builder()
            .totalInterviews(totalInterviews)
            .completedInterviews(completedInterviews)
            .inProgressInterviews(inProgressInterviews)
            .abandonedInterviews(abandonedInterviews)
            .averageCompletionRate(averageCompletionRate)
            .averageInterviewDuration(averageDuration)
            .averageTurnsPerInterview(averageTurns)
            .interviewsByStatus(interviewsByStatus)
            .interviewsByTemplate(interviewsByTemplate)
            .averageScoresByCategory(averageScores)
            .trends(trends)
            .build();
    }
    
    public CandidateAnalyticsResponse getCandidateAnalytics() {
        long totalCandidates = candidateRepository.count();
        long candidatesWithInterviews = sessionRepository.findAll().stream()
            .map(s -> s.getCandidate().getId())
            .distinct()
            .count();
        long candidatesWithResumes = candidateRepository.findAll().stream()
            .filter(c -> c.getResumeUrl() != null && !c.getResumeUrl().isEmpty())
            .count();
        
        long totalInterviews = sessionRepository.count();
        double averageInterviewsPerCandidate = totalCandidates > 0 
            ? (double) totalInterviews / totalCandidates 
            : 0.0;
        
        // Calculate average score across all completed interviews
        List<InterviewSession> completedSessions = sessionRepository.findByStatus(InterviewSession.SessionStatus.COMPLETED);
        double averageScore = completedSessions.stream()
            .flatMap(s -> turnRepository.findBySession_IdOrderByTurnNumberAsc(s.getId()).stream())
            .filter(t -> t.getTechnicalScore() != null)
            .mapToDouble(InterviewTurn::getTechnicalScore)
            .average()
            .orElse(0.0);
        
        // Candidates by recommendation
        Map<String, Long> candidatesByRecommendation = completedSessions.stream()
            .filter(s -> s.getRecommendation() != null)
            .collect(Collectors.groupingBy(
                s -> s.getRecommendation().name(),
                Collectors.counting()
            ));
        
        // Candidates by month
        Map<String, Long> candidatesByMonth = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            String monthKey = monthStart.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            long count = candidateRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && 
                    c.getCreatedAt().toLocalDate().isAfter(monthStart.minusDays(1)) &&
                    c.getCreatedAt().toLocalDate().isBefore(monthStart.plusMonths(1)))
                .count();
            candidatesByMonth.put(monthKey, count);
        }
        
        // Top performers
        List<CandidateAnalyticsResponse.CandidatePerformanceData> topPerformers = completedSessions.stream()
            .filter(s -> s.getRecommendation() != null && 
                (s.getRecommendation() == InterviewSession.Recommendation.STRONG || 
                 s.getRecommendation() == InterviewSession.Recommendation.HIRE))
            .map(s -> {
                List<InterviewTurn> turns = turnRepository.findBySession_IdOrderByTurnNumberAsc(s.getId());
                double avgScore = turns.stream()
                    .filter(t -> t.getTechnicalScore() != null)
                    .mapToDouble(InterviewTurn::getTechnicalScore)
                    .average()
                    .orElse(0.0);
                
                return CandidateAnalyticsResponse.CandidatePerformanceData.builder()
                    .candidateId(s.getCandidate().getId())
                    .candidateName(s.getCandidate().getFirstName() + " " + s.getCandidate().getLastName())
                    .interviewCount(1)
                    .averageScore(avgScore)
                    .recommendation(s.getRecommendation().name())
                    .build();
            })
            .sorted((a, b) -> Double.compare(b.getAverageScore(), a.getAverageScore()))
            .limit(10)
            .collect(Collectors.toList());
        
        // Needs attention
        List<CandidateAnalyticsResponse.CandidatePerformanceData> needsAttention = completedSessions.stream()
            .filter(s -> s.getRecommendation() != null && 
                (s.getRecommendation() == InterviewSession.Recommendation.REJECT || 
                 s.getRecommendation() == InterviewSession.Recommendation.WEAK))
            .map(s -> {
                List<InterviewTurn> turns = turnRepository.findBySession_IdOrderByTurnNumberAsc(s.getId());
                double avgScore = turns.stream()
                    .filter(t -> t.getTechnicalScore() != null)
                    .mapToDouble(InterviewTurn::getTechnicalScore)
                    .average()
                    .orElse(0.0);
                
                return CandidateAnalyticsResponse.CandidatePerformanceData.builder()
                    .candidateId(s.getCandidate().getId())
                    .candidateName(s.getCandidate().getFirstName() + " " + s.getCandidate().getLastName())
                    .interviewCount(1)
                    .averageScore(avgScore)
                    .recommendation(s.getRecommendation().name())
                    .build();
            })
            .sorted((a, b) -> Double.compare(a.getAverageScore(), b.getAverageScore()))
            .limit(10)
            .collect(Collectors.toList());
        
        return CandidateAnalyticsResponse.builder()
            .totalCandidates(totalCandidates)
            .candidatesWithInterviews(candidatesWithInterviews)
            .candidatesWithResumes(candidatesWithResumes)
            .averageInterviewsPerCandidate(averageInterviewsPerCandidate)
            .averageScore(averageScore)
            .candidatesByRecommendation(candidatesByRecommendation)
            .candidatesByMonth(candidatesByMonth)
            .topPerformers(topPerformers)
            .needsAttention(needsAttention)
            .build();
    }
    
    public TrendAnalysisResponse getTrendAnalysis(String metric, String period, int days) {
        List<TrendAnalysisResponse.TrendDataPoint> dataPoints = new ArrayList<>();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            final LocalDate currentDate = date; // Make effectively final for lambda
            long value = 0L;
            
            switch (metric.toLowerCase()) {
                case "interviews":
                    value = sessionRepository.findAll().stream()
                        .filter(s -> s.getStartedAt() != null && 
                            s.getStartedAt().toLocalDate().equals(currentDate))
                        .count();
                    break;
                case "candidates":
                    value = candidateRepository.findAll().stream()
                        .filter(c -> c.getCreatedAt() != null && 
                            c.getCreatedAt().toLocalDate().equals(currentDate))
                        .count();
                    break;
                case "completions":
                    value = sessionRepository.findAll().stream()
                        .filter(s -> s.getCompletedAt() != null && 
                            s.getCompletedAt().toLocalDate().equals(currentDate) &&
                            s.getStatus() == InterviewSession.SessionStatus.COMPLETED)
                        .count();
                    break;
            }
            
            // Calculate percentage change
            Double percentageChange = null;
            if (dataPoints.size() > 0) {
                Long previousValue = dataPoints.get(dataPoints.size() - 1).getValue();
                if (previousValue != null && previousValue > 0) {
                    percentageChange = ((double) (value - previousValue) / previousValue) * 100;
                }
            }
            
            dataPoints.add(TrendAnalysisResponse.TrendDataPoint.builder()
                .date(date.format(formatter))
                .value(value)
                .percentageChange(percentageChange)
                .build());
        }
        
        return TrendAnalysisResponse.builder()
            .metric(metric)
            .period(period)
            .dataPoints(dataPoints)
            .build();
    }
    
    public com.aiinterview.dto.JobStatisticsResponse getJobAnalytics() {
        // Use existing jobRepository to calculate statistics
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
        
        return com.aiinterview.dto.JobStatisticsResponse.builder()
            .totalJobs(totalJobs)
            .activeJobs(activeJobs)
            .totalCandidates(totalCandidates)
            .totalInterviews(totalInterviews)
            .jobsBySeniorityLevel(jobsBySeniority)
            .averageInterviewsPerJob(averageInterviewsPerJob)
            .build();
    }
}

