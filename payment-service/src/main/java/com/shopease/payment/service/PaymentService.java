package com.shopease.payment.service;

import com.shopease.payment.dto.PaymentRequest;
import com.shopease.payment.dto.PaymentResponse;
import com.shopease.payment.model.Payment;
import com.shopease.payment.model.PaymentStatus;
import com.shopease.payment.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing payment for order: {}", request.getOrderId());

        // Generate a unique transaction ID
        String transactionId = generateTransactionId();

        // Create payment record
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(transactionId);
        payment.setPaymentDetails(request.getPaymentDetails());
        payment.setStatus(PaymentStatus.PROCESSING);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        // Save payment record
        payment = paymentRepository.save(payment);
        log.info("Payment record created with ID: {}", payment.getId());

        // Simulate payment processing (in a real application, this would call a payment gateway)
        try {
            Thread.sleep(2000); // Simulate processing time
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaymentDate(LocalDateTime.now());
        } catch (Exception e) {
            log.error("Payment processing failed: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
        }

        payment.setUpdatedAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        return convertToResponse(payment);
    }

    public PaymentResponse getPayment(Long paymentId) {
        try {
            log.info("Fetching payment with ID: {}", paymentId);
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
            return convertToResponse(payment);
        } catch (Exception e) {
            log.error("Error fetching payment: {}", e.getMessage());
            throw new RuntimeException("Error fetching payment: " + e.getMessage());
        }
    }

    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        try {
            log.info("Fetching payment with transaction ID: {}", transactionId);
            Payment payment = paymentRepository.findByTransactionId(transactionId)
                    .orElseThrow(() -> new RuntimeException("Payment not found with transaction ID: " + transactionId));
            return convertToResponse(payment);
        } catch (Exception e) {
            log.error("Error fetching payment: {}", e.getMessage());
            throw new RuntimeException("Error fetching payment: " + e.getMessage());
        }
    }

    private String generateTransactionId() {
        return "TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }

    private PaymentResponse convertToResponse(Payment payment) {
        try {
            PaymentResponse response = new PaymentResponse();
            response.setId(payment.getId());
            response.setOrderId(payment.getOrderId());
            response.setAmount(payment.getAmount());
            response.setPaymentMethod(payment.getPaymentMethod());
            response.setStatus(payment.getStatus());
            response.setTransactionId(payment.getTransactionId());
            response.setPaymentDetails(payment.getPaymentDetails());
            response.setPaymentDate(payment.getPaymentDate());
            response.setCreatedAt(payment.getCreatedAt());
            response.setUpdatedAt(payment.getUpdatedAt());
            return response;
        } catch (Exception e) {
            log.error("Error converting payment to response: {}", e.getMessage());
            throw new RuntimeException("Error converting payment to response: " + e.getMessage());
        }
    }
} 