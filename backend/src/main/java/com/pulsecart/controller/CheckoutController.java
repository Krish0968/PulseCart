package com.pulsecart.controller;

import com.pulsecart.dto.CheckoutRequest;
import com.pulsecart.dto.OrderDto;
import com.pulsecart.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto> checkout(Authentication authentication, @Valid @RequestBody CheckoutRequest request) {
        String email = authentication.getName();
        OrderDto orderDto = new OrderDto(orderService.placeOrder(
                email,
                request.getShippingAddress(),
                request.getPaymentMethod(),
                request.getMockPaymentStatus()
        ));
        return ResponseEntity.ok(orderDto);
    }
}
