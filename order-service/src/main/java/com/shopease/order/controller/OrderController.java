package com.shopease.order.controller;

import com.shopease.order.dto.OrderRequestDTO;
import com.shopease.order.dto.OrderResponseDTO;
import com.shopease.order.exception.InvalidOrderStatusException;
import com.shopease.order.model.OrderStatus;
import com.shopease.order.service.OrderService;
import com.shopease.order.validation.ValidOrderStatus;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody OrderRequestDTO request) {
        log.info("Received order creation request for customer: {}", request.getCustomerId());
        OrderResponseDTO response = orderService.createOrder(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrdersForAdmin() {
        log.info("Admin fetching all orders");
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrder(
            @PathVariable Long orderId,
            @RequestParam Long customerId) {
        log.info("Fetching order with ID: {} for customer: {}", orderId, customerId);
        OrderResponseDTO response = orderService.getOrder(orderId, customerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponseDTO>> getCustomerOrders(@PathVariable Long customerId) {
        log.info("Fetching all orders for customer: {}", customerId);
        return ResponseEntity.ok(orderService.getCustomerOrders(customerId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Long customerId,
            @ValidOrderStatus @RequestParam String status) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        log.info("Updating order status to {} for order ID: {}", orderStatus, orderId);
        OrderResponseDTO response = orderService.updateOrderStatus(orderId, customerId, orderStatus);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatusAsAdmin(
            @PathVariable Long orderId,
            @ValidOrderStatus @RequestParam String status) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        log.info("Admin updating order status to {} for order ID: {}", orderStatus, orderId);
        OrderResponseDTO response = orderService.updateOrderStatusAsAdmin(orderId, orderStatus);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        log.info("Test endpoint called");
        return ResponseEntity.ok("Order service is working!");
    }
} 