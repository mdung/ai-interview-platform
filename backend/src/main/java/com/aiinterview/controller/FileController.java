package com.aiinterview.controller;

import com.aiinterview.dto.FileMetadataResponse;
import com.aiinterview.dto.FileUploadResponse;
import com.aiinterview.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    
    private final FileService fileService;
    
    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) String description) throws IOException {
        FileUploadResponse response = fileService.uploadFile(file, fileType, description);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) throws IOException {
        Resource resource = fileService.downloadFile(id);
        
        // Get file metadata to determine content type and filename
        FileMetadataResponse metadata = fileService.getFileMetadata(id);
        
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(metadata.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + metadata.getOriginalFilename() + "\"")
            .body(resource);
    }
    
    @GetMapping("/{id}/metadata")
    public ResponseEntity<FileMetadataResponse> getFileMetadata(@PathVariable Long id) {
        FileMetadataResponse metadata = fileService.getFileMetadata(id);
        return ResponseEntity.ok(metadata);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) throws IOException {
        fileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }
}


