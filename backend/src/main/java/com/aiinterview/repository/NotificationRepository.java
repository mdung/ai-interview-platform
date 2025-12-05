package com.aiinterview.repository;

import com.aiinterview.model.Notification;
import com.aiinterview.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);
    Page<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Notification> findByUser_IdAndReadFalseOrderByCreatedAtDesc(Long userId);
    long countByUser_IdAndReadFalse(Long userId);
}

