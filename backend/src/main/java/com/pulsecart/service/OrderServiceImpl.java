package com.pulsecart.service;

import com.pulsecart.exception.BadRequestException;
import com.pulsecart.exception.InsufficientStockException;
import com.pulsecart.exception.ResourceNotFoundException;
import com.pulsecart.model.*;
import com.pulsecart.repository.OrderRepository;
import com.pulsecart.repository.ProductRepository;
import com.pulsecart.repository.UserRepository;
import com.pulsecart.repository.InteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private InteractionRepository interactionRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Override
    @Transactional
    public Order placeOrder(String email, String shippingAddress, String paymentMethod, String mockPaymentStatus) {
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Get user's cart
        Cart cart = cartService.getCartByUserEmail(email);
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty. Cannot place order.");
        }

        // Simulate payment status
        if ("FAILED".equalsIgnoreCase(mockPaymentStatus)) {
            throw new BadRequestException("Payment failed. Order cannot be placed.");
        }

        // Generate Order details
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        // Sum total amount
        BigDecimal totalAmount = cart.getItems().stream()
                .map(item -> {
                    BigDecimal price = item.getProduct().getDiscountPrice() != null 
                            ? item.getProduct().getDiscountPrice() 
                            : item.getProduct().getPrice();
                    return price.multiply(new BigDecimal(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(orderNumber);
        order.setStatus("COMPLETED");
        order.setShippingAddress(shippingAddress);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("PAID");
        order.setTotalAmount(totalAmount);

        // Revalidate stock availability and deplete stock with write lock
        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            entityManager.refresh(product, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product: " 
                        + product.getName() + ". Available: " + product.getStockQuantity());
            }

            // Deplete stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            // Create Order Item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice());
            order.getItems().add(orderItem);

            // Log PURCHASE interaction (weight = 5)
            try {
                UserInteraction interaction = new UserInteraction();
                interaction.setUser(user);
                interaction.setProduct(product);
                interaction.setInteractionType("PURCHASE");
                interaction.setWeight(5);
                interactionRepository.save(interaction);
            } catch (Exception e) {
                // Non-blocking interaction logging failure
            }
        }

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartService.clearCart(email);

        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderByIdAndEmail(Long orderId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId + " for this user"));
    }
}
