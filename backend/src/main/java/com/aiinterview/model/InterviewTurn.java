package com.aiinterview.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_turns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class InterviewTurn {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;
    
    @Column(nullable = false)
    private Integer turnNumber;
    
    @Column(length = 2000, nullable = false)
    private String question;
    
    @Column(length = 5000)
    private String answer;
    
    @Column(nullable = false)
    private LocalDateTime questionTimestamp;
    
    private LocalDateTime answerTimestamp;
    
    private Long answerDurationMs;
    
    @Column(length = 500)
    private String audioUrl;
    
    @Column(length = 1000)
    private String aiComment;
    
    private Double communicationScore;
    
    private Double technicalScore;
    
    private Double clarityScore;
    
    @Column(nullable = false)
    private Boolean hasAntiCheatSignal = false;
    
    @Column(length = 500)
    private String antiCheatDetails;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

