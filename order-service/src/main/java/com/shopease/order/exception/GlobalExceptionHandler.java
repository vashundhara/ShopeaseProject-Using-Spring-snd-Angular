package com.shopease.order.exception;

import com.shopease.order.model.OrderStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidOrderStatusException.class)
    public ResponseEntity<ApiError> handleInvalidOrderStatus(InvalidOrderStatusException ex) {
        Map<String, String> details = new HashMap<>();
        details.put("invalidStatus", ex.getInvalidStatus());
        details.put("validStatuses", String.join(", ", ex.getValidStatuses()));
        
        ApiError apiError = new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid Order Status",
            ex.getMessage(),
            details
        );
        
        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message;
        if (ex.getRequiredType() != null && ex.getRequiredType().isEnum()) {
            Object[] enumConstants = ex.getRequiredType().getEnumConstants();
            StringBuilder validValues = new StringBuilder();
            for (int i = 0; i < enumConstants.length; i++) {
                if (i > 0) validValues.append(", ");
                validValues.append(enumConstants[i].toString());
            }
            
            message = String.format("Invalid value '%s' for parameter '%s'. Valid values are: %s",
                ex.getValue(),
                ex.getName(),
                validValues.toString());
        } else {
            message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s",
                ex.getValue(),
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        }
            
        ApiError apiError = new ApiError(
            HttpStatus.BAD_REQUEST,
            "Type Mismatch",
            message
        );
        
        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ApiError apiError = new ApiError(
            HttpStatus.BAD_REQUEST,
            "Validation Error",
            "Invalid request parameters",
            errors
        );
        
        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        ApiError apiError = new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid JSON",
            "The request body contains invalid JSON format"
        );
        
        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        ApiError apiError = new ApiError(
            HttpStatus.METHOD_NOT_ALLOWED,
            "Method Not Allowed",
            String.format("HTTP method '%s' is not supported for this endpoint", ex.getMethod())
        );
        
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(apiError);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        ApiError apiError = new ApiError(
            HttpStatus.BAD_REQUEST,
            "Invalid Argument",
            ex.getMessage()
        );
        
        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        ApiError apiError = new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Internal Server Error",
            "An unexpected error occurred"
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiError);
    }
} 