package com.pulsecart.service;

import com.pulsecart.model.Order;
import java.util.List;

public interface OrderService {
    Order placeOrder(String email, String shippingAddress, String paymentMethod, String mockPaymentStatus);
    List<Order> getOrdersByUserEmail(String email);
    Order getOrderByIdAndEmail(Long orderId, String email);
}
