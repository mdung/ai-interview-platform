package com.aiinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadataResponse {
    private Long id;
    private String filePath;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String fileType;
    private Long uploadedById;
    private String uploadedByEmail;
    private String description;
    private LocalDateTime uploadedAt;
    private Boolean active;
}



