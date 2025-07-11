package com.shopease.registration.controller;

import com.shopease.registration.exception.RegistrationException;
import com.shopease.registration.model.User;
import com.shopease.registration.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registration")
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        log.info("Received registration request for user: {}", user.getUsername());
        try {
            User registeredUser = userService.registerUser(user);
            log.info("User registered successfully: {}", registeredUser.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (RegistrationException e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during registration: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred during registration");
        }
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<Boolean> checkUsernameAvailability(@PathVariable String username) {
        log.info("Checking username availability: {}", username);
        boolean isAvailable = !userService.findByUsername(username).isPresent();
        return ResponseEntity.ok(isAvailable);
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmailAvailability(@PathVariable String email) {
        log.info("Checking email availability: {}", email);
        boolean isAvailable = !userService.findByEmail(email).isPresent();
        return ResponseEntity.ok(isAvailable);
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        log.info("Test endpoint called");
        return ResponseEntity.ok("Registration service is working!");
    }
} 