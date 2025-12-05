package com.aiinterview.service;

import com.aiinterview.dto.LoginRequest;
import com.aiinterview.dto.LoginResponse;
import com.aiinterview.model.User;
import com.aiinterview.repository.UserRepository;
import com.aiinterview.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!user.getActive()) {
            throw new RuntimeException("User account is inactive");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());
        
        return LoginResponse.builder()
            .token(token)
            .email(user.getEmail())
            .role(user.getRole().name())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .build();
    }
}

