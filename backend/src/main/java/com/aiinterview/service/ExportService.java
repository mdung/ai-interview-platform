package com.aiinterview.service;

import com.aiinterview.dto.TranscriptResponse;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {
    
    private final TranscriptService transcriptService;
    
    public byte[] exportTranscriptAsPdf(String sessionId) throws IOException {
        TranscriptResponse transcript = transcriptService.getTranscript(sessionId);
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Title
        document.add(new Paragraph("Interview Transcript")
            .setFontSize(20)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER));
        
        document.add(new Paragraph("\n"));
        
        // Session Info
        document.add(new Paragraph("Candidate: " + transcript.getCandidateName()));
        document.add(new Paragraph("Template: " + transcript.getTemplateName()));
        document.add(new Paragraph("Language: " + transcript.getLanguage()));
        document.add(new Paragraph("Status: " + transcript.getStatus()));
        document.add(new Paragraph("\n"));
        
        // Transcript
        document.add(new Paragraph("Transcript")
            .setFontSize(16)
            .setBold());
        document.add(new Paragraph("\n"));
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (InterviewTurnResponse turn : transcript.getTurns()) {
            document.add(new Paragraph("Turn " + turn.getTurnNumber())
                .setBold());
            
            if (turn.getQuestionTimestamp() != null) {
                document.add(new Paragraph("Time: " + turn.getQuestionTimestamp().format(formatter))
                    .setFontSize(10)
                    .setItalic());
            }
            
            document.add(new Paragraph("Question: " + turn.getQuestion()));
            
            if (turn.getAnswer() != null) {
                document.add(new Paragraph("Answer: " + turn.getAnswer()));
            }
            
            if (turn.getAiComment() != null) {
                document.add(new Paragraph("AI Comment: " + turn.getAiComment())
                    .setItalic());
            }
            
            document.add(new Paragraph("\n"));
        }
        
        // Evaluation
        if (transcript.getAiSummary() != null) {
            document.add(new Paragraph("Evaluation")
                .setFontSize(16)
                .setBold());
            document.add(new Paragraph("\n"));
            
            document.add(new Paragraph("Summary: " + transcript.getAiSummary()));
            
            if (transcript.getStrengths() != null) {
                document.add(new Paragraph("Strengths: " + transcript.getStrengths()));
            }
            
            if (transcript.getWeaknesses() != null) {
                document.add(new Paragraph("Weaknesses: " + transcript.getWeaknesses()));
            }
            
            if (transcript.getRecommendation() != null) {
                document.add(new Paragraph("Recommendation: " + transcript.getRecommendation()));
            }
        }
        
        document.close();
        return baos.toByteArray();
    }
    
    public String exportTranscriptAsCsv(String sessionId) {
        TranscriptResponse transcript = transcriptService.getTranscript(sessionId);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Turn Number,Question,Answer,Question Timestamp,Answer Timestamp,Duration (ms),AI Comment\n");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (InterviewTurnResponse turn : transcript.getTurns()) {
            csv.append(turn.getTurnNumber()).append(",");
            csv.append("\"").append(escapeCsv(turn.getQuestion())).append("\",");
            csv.append("\"").append(escapeCsv(turn.getAnswer() != null ? turn.getAnswer() : "")).append("\",");
            csv.append(turn.getQuestionTimestamp() != null ? turn.getQuestionTimestamp().format(formatter) : "").append(",");
            csv.append(turn.getAnswerTimestamp() != null ? turn.getAnswerTimestamp().format(formatter) : "").append(",");
            csv.append(turn.getAnswerDurationMs() != null ? turn.getAnswerDurationMs() : "").append(",");
            csv.append("\"").append(escapeCsv(turn.getAiComment() != null ? turn.getAiComment() : "")).append("\"\n");
        }
        
        return csv.toString();
    }
    
    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}

