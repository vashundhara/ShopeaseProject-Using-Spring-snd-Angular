package com.shopease.login.service;

import com.shopease.login.dto.AuthRequest;
import com.shopease.login.dto.AuthResponse;
import com.shopease.login.model.User;
import com.shopease.login.repository.UserRepository;
import com.shopease.login.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {
        log.info("Starting registration process for user: {}", user.getUsername());
        
        if (userRepository.existsByUsername(user.getUsername())) {
            log.error("Registration failed: Username {} already exists", user.getUsername());
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(user.getEmail())) {
            log.error("Registration failed: Email {} already exists", user.getEmail());
            throw new RuntimeException("Email already exists");
        }

        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            log.info("User registered successfully: {}", savedUser.getUsername());
            return savedUser;
        } catch (Exception e) {
            log.error("Error during user registration: {}", e.getMessage());
            throw new RuntimeException("Error during registration: " + e.getMessage());
        }
    }

    public AuthResponse authenticate(AuthRequest authRequest) {
        log.info("Attempting to authenticate user: {}", authRequest.getUsername());
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(authRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.info("User authenticated successfully: {}", authRequest.getUsername());
        
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }
} 