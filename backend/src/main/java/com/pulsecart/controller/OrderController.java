package com.pulsecart.controller;

import com.pulsecart.dto.OrderDto;
import com.pulsecart.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderDto>> getMyOrders(Authentication authentication) {
        String email = authentication.getName();
        List<OrderDto> orders = orderService.getOrdersByUserEmail(email).stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrderDetails(Authentication authentication, @PathVariable Long orderId) {
        String email = authentication.getName();
        OrderDto orderDto = new OrderDto(orderService.getOrderByIdAndEmail(orderId, email));
        return ResponseEntity.ok(orderDto);
    }
}
