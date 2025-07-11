package com.shopease.registration.service;

import com.shopease.registration.exception.RegistrationException;
import com.shopease.registration.model.User;
import com.shopease.registration.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(User user) {
        log.info("Attempting to register new user: {}", user.getUsername());
        
        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            log.warn("Registration failed: Username {} already exists", user.getUsername());
            throw new RegistrationException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            log.warn("Registration failed: Email {} already exists", user.getEmail());
            throw new RegistrationException("Email already exists");
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getUsername());
        
        return savedUser;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
} 