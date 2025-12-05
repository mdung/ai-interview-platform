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
import java.util.List;

@Entity
@Table(name = "interview_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class InterviewTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewMode mode;
    
    @Column(length = 5000)
    private String systemPrompt;
    
    @ElementCollection
    @CollectionTable(name = "template_question_bank", joinColumns = @JoinColumn(name = "template_id"))
    @Column(name = "question", length = 1000)
    private List<String> questionBank;
    
    @Column(nullable = false)
    private Integer estimatedDurationMinutes = 30;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum InterviewMode {
        VOICE, TEXT, BOTH
    }
}

