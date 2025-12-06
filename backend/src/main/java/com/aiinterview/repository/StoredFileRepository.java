package com.aiinterview.repository;

import com.aiinterview.model.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoredFileRepository extends JpaRepository<StoredFile, Long> {
    Optional<StoredFile> findByFilePath(String filePath);
}

