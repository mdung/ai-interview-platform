package com.aiinterview.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class InterviewSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String sessionId;
    
    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;
    
    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private InterviewTemplate template;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;
    
    @Column(length = 50)
    private String language;
    
    @Column(nullable = false)
    private LocalDateTime startedAt;
    
    private LocalDateTime completedAt;
    
    @Column(length = 5000)
    private String aiSummary;
    
    @Column(length = 2000)
    private String strengths;
    
    @Column(length = 2000)
    private String weaknesses;
    
    @Enumerated(EnumType.STRING)
    private Recommendation recommendation;
    
    @Column(nullable = false)
    private Integer totalTurns = 0;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum SessionStatus {
        PENDING, IN_PROGRESS, PAUSED, COMPLETED, ABANDONED
    }
    
    public enum Recommendation {
        REJECT, WEAK, MAYBE, STRONG, HIRE
    }
}

