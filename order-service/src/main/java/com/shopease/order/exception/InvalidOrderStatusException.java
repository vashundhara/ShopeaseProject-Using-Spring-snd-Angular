package com.shopease.order.exception;

public class InvalidOrderStatusException extends IllegalArgumentException {
    private final String invalidStatus;
    private final String[] validStatuses;

    public InvalidOrderStatusException(String invalidStatus, String[] validStatuses) {
        super(String.format("Invalid order status: '%s'. Valid statuses are: %s", 
            invalidStatus, String.join(", ", validStatuses)));
        this.invalidStatus = invalidStatus;
        this.validStatuses = validStatuses;
    }

    public String getInvalidStatus() {
        return invalidStatus;
    }

    public String[] getValidStatuses() {
        return validStatuses;
    }
} 