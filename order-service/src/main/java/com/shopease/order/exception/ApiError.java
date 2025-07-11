package com.shopease.order.exception;

import lombok.Data;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class ApiError {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private Map<String, String> details;

    public ApiError(HttpStatus status, String error, String message) {
        this.timestamp = LocalDateTime.now();
        this.status = status.value();
        this.error = error;
        this.message = message;
    }

    public ApiError(HttpStatus status, String error, String message, Map<String, String> details) {
        this(status, error, message);
        this.details = details;
    }
} 