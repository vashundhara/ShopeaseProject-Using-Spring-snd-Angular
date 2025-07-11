package com.shopease.order.service;

import com.shopease.order.dto.OrderItemDTO;
import com.shopease.order.dto.OrderRequestDTO;
import com.shopease.order.dto.OrderResponseDTO;
import com.shopease.order.model.Order;
import com.shopease.order.model.OrderItem;
import com.shopease.order.model.OrderStatus;
import com.shopease.order.repository.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request) {
        log.info("Creating order for customer: {}", request.getCustomerId());

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // Convert OrderItemDTOs to OrderItems
        List<OrderItem> items = request.getItems().stream()
            .map(this::convertToOrderItem)
            .collect(Collectors.toList());

        // Set the order reference for each item
        for (OrderItem item : items) {
            item.setOrder(order);
        }
        order.setItems(items);

        // Save the order
        order = orderRepository.save(order);
        log.info("Order created with ID: {}", order.getId());

        return convertToResponse(order);
    }

    public OrderResponseDTO getOrder(Long orderId, Long customerId) {
        log.info("Fetching order with ID: {} for customer: {}", orderId, customerId);
        return orderRepository.findByIdAndCustomerId(orderId, customerId)
            .map(this::convertToResponse)
            .orElseThrow(() -> {
                log.warn("Order not found with ID: {} for customer: {}", orderId, customerId);
                return new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    String.format("Order with ID %d not found for customer %d", orderId, customerId)
                );
            });
    }

    public List<OrderResponseDTO> getCustomerOrders(Long customerId) {
        log.info("Fetching all orders for customer: {}", customerId);
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        if (orders.isEmpty()) {
            log.info("No orders found for customer: {}", customerId);
        }
        log.info("Found {} orders for customer: {}", orders.size(), customerId);
        return orders.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, Long customerId, OrderStatus newStatus) {
        log.info("Updating order status to {} for order ID: {}", newStatus, orderId);
        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
            .orElseThrow(() -> {
                log.warn("Order not found with ID: {} for customer: {}", orderId, customerId);
                return new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    String.format("Order with ID %d not found for customer %d", orderId, customerId)
                );
            });

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepository.save(order);
        log.info("Order status updated to {} for order ID: {}", newStatus, orderId);

        return convertToResponse(order);
    }

    @Transactional
    public OrderResponseDTO updateOrderStatusAsAdmin(Long orderId, OrderStatus newStatus) {
        log.info("Admin updating order status to {} for order ID: {}", newStatus, orderId);
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> {
                log.warn("Order not found with ID: {} (admin)", orderId);
                return new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    String.format("Order with ID %d not found", orderId)
                );
            });

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepository.save(order);
        log.info("Order status updated to {} for order ID: {} (admin)", newStatus, orderId);

        return convertToResponse(order);
    }

    public List<OrderResponseDTO> getAllOrders() {
        log.info("Fetching all orders for admin");
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    private OrderItem convertToOrderItem(OrderItemDTO dto) {
        OrderItem item = new OrderItem();
        item.setProductId(dto.getProductId());
        item.setQuantity(dto.getQuantity());
        item.setPrice(dto.getPrice());
        return item;
    }

    private OrderResponseDTO convertToResponse(Order order) {
        log.trace("Converting Order entity to OrderResponseDTO for order ID: {}", order.getId());
        try {
            OrderResponseDTO response = new OrderResponseDTO();
            response.setId(order.getId());
            response.setCustomerId(order.getCustomerId());
            response.setTotalAmount(order.getTotalAmount());
            response.setStatus(order.getStatus());
            response.setShippingAddress(order.getShippingAddress());
            response.setBillingAddress(order.getBillingAddress());
            response.setPaymentMethod(order.getPaymentMethod());
            response.setPaymentStatus(order.getPaymentStatus());
            response.setCreatedAt(order.getCreatedAt());
            response.setUpdatedAt(order.getUpdatedAt());

            // Convert OrderItems to OrderItemDTOs
            List<OrderItemDTO> items = order.getItems().stream()
                .map(this::convertToOrderItemDTO)
                .collect(Collectors.toList());
            response.setItems(items);

            log.trace("Successfully converted Order entity to OrderResponseDTO for order ID: {}", order.getId());
            return response;
        } catch (Exception e) {
            log.error("Error converting Order entity to OrderResponseDTO for order ID: {}", order.getId(), e);
            throw new RuntimeException("Error converting order", e);
        }
    }

    private OrderItemDTO convertToOrderItemDTO(OrderItem item) {
        log.trace("Converting OrderItem entity to OrderItemDTO for product ID: {}", item.getProductId());
        try {
            OrderItemDTO dto = new OrderItemDTO();
            dto.setProductId(item.getProductId());
            dto.setQuantity(item.getQuantity());
            dto.setPrice(item.getPrice());
            log.trace("Successfully converted OrderItem entity to OrderItemDTO for product ID: {}", item.getProductId());
            return dto;
        } catch (Exception e) {
            log.error("Error converting OrderItem entity to OrderItemDTO for product ID: {}", item.getProductId(), e);
            throw new RuntimeException("Error converting order item", e);
        }
    }
} 