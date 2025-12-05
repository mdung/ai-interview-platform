package com.aiinterview.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    public String storeFile(MultipartFile file, String subdirectory) throws IOException {
        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, subdirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : "";
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative path
        return subdirectory + "/" + filename;
    }
    
    public Resource loadFileAsResource(String filePath) throws IOException {
        Path path = Paths.get(uploadDir).resolve(filePath).normalize();
        Resource resource = new UrlResource(path.toUri());
        
        if (resource.exists()) {
            return resource;
        } else {
            throw new IOException("File not found: " + filePath);
        }
    }
    
    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDir).resolve(filePath).normalize();
        Files.deleteIfExists(path);
    }
}

