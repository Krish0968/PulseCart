package com.pulsecart.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {
    @NotBlank
    private String shippingAddress;

    @NotBlank
    private String paymentMethod;

    @NotBlank
    private String mockPaymentStatus; // SUCCESS or FAILED

    public CheckoutRequest() {}

    public CheckoutRequest(String shippingAddress, String paymentMethod, String mockPaymentStatus) {
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.mockPaymentStatus = mockPaymentStatus;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getMockPaymentStatus() {
        return mockPaymentStatus;
    }

    public void setMockPaymentStatus(String mockPaymentStatus) {
        this.mockPaymentStatus = mockPaymentStatus;
    }
}
