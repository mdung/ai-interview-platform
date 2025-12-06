package com.aiinterview.service;

import com.aiinterview.dto.FileMetadataResponse;
import com.aiinterview.dto.FileUploadResponse;
import com.aiinterview.model.StoredFile;
import com.aiinterview.model.User;
import com.aiinterview.repository.StoredFileRepository;
import com.aiinterview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class FileService {
    
    private final FileStorageService fileStorageService;
    private final StoredFileRepository fileRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public FileUploadResponse uploadFile(MultipartFile file, String fileType, String description) throws IOException {
        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Determine subdirectory based on file type
        String subdirectory = determineSubdirectory(fileType);
        
        // Store file
        String filePath = fileStorageService.storeFile(file, subdirectory);
        
        // Save file metadata
        StoredFile storedFile = StoredFile.builder()
            .filePath(filePath)
            .originalFilename(file.getOriginalFilename())
            .contentType(file.getContentType())
            .fileSize(file.getSize())
            .fileType(fileType != null ? fileType.toUpperCase() : "DOCUMENT")
            .uploadedBy(user)
            .description(description)
            .active(true)
            .build();
        
        storedFile = fileRepository.save(storedFile);
        
        return FileUploadResponse.builder()
            .fileId(storedFile.getId())
            .filePath(filePath)
            .originalFilename(storedFile.getOriginalFilename())
            .contentType(storedFile.getContentType())
            .fileSize(storedFile.getFileSize())
            .message("File uploaded successfully")
            .build();
    }
    
    public Resource downloadFile(Long fileId) throws IOException {
        StoredFile file = fileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File not found"));
        
        if (!file.getActive()) {
            throw new RuntimeException("File has been deleted");
        }
        
        return fileStorageService.loadFileAsResource(file.getFilePath());
    }
    
    public FileMetadataResponse getFileMetadata(Long fileId) {
        StoredFile file = fileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File not found"));
        
        return FileMetadataResponse.builder()
            .id(file.getId())
            .filePath(file.getFilePath())
            .originalFilename(file.getOriginalFilename())
            .contentType(file.getContentType())
            .fileSize(file.getFileSize())
            .fileType(file.getFileType())
            .uploadedById(file.getUploadedBy() != null ? file.getUploadedBy().getId() : null)
            .uploadedByEmail(file.getUploadedBy() != null ? file.getUploadedBy().getEmail() : null)
            .description(file.getDescription())
            .uploadedAt(file.getUploadedAt())
            .active(file.getActive())
            .build();
    }
    
    @Transactional
    public void deleteFile(Long fileId) throws IOException {
        StoredFile file = fileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File not found"));
        
        // Soft delete - mark as inactive
        file.setActive(false);
        fileRepository.save(file);
        
        // Optionally delete physical file
        // fileStorageService.deleteFile(file.getFilePath());
    }
    
    private String determineSubdirectory(String fileType) {
        if (fileType == null) {
            return "documents";
        }
        
        switch (fileType.toUpperCase()) {
            case "RESUME":
                return "resumes";
            case "AUDIO":
                return "audio";
            case "IMAGE":
                return "images";
            case "DOCUMENT":
            default:
                return "documents";
        }
    }
}

