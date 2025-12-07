package com.aiinterview.config;

import com.aiinterview.model.User;
import com.aiinterview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if it doesn't exist
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = User.builder()
                .email("admin@example.com")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Admin")
                .lastName("User")
                .role(User.Role.ADMIN)
                .active(true)
                .build();
            
            userRepository.save(admin);
            log.info("Default admin user created: admin@example.com / admin123");
        } else {
            log.info("Admin user already exists");
        }
        
        // Create default recruiter user if it doesn't exist
        if (!userRepository.existsByEmail("recruiter@example.com")) {
            User recruiter = User.builder()
                .email("recruiter@example.com")
                .password(passwordEncoder.encode("recruiter123"))
                .firstName("Recruiter")
                .lastName("User")
                .role(User.Role.RECRUITER)
                .active(true)
                .build();
            
            userRepository.save(recruiter);
            log.info("Default recruiter user created: recruiter@example.com / recruiter123");
        } else {
            log.info("Recruiter user already exists");
        }
    }
}



