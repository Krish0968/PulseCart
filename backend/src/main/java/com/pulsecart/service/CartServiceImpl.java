package com.pulsecart.service;

import com.pulsecart.exception.BadRequestException;
import com.pulsecart.exception.ResourceNotFoundException;
import com.pulsecart.model.Cart;
import com.pulsecart.model.CartItem;
import com.pulsecart.model.Product;
import com.pulsecart.model.User;
import com.pulsecart.repository.CartItemRepository;
import com.pulsecart.repository.CartRepository;
import com.pulsecart.repository.ProductRepository;
import com.pulsecart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Cart getCartByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    @Override
    public Cart addItemToCart(String email, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        Cart cart = getCartByUserEmail(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (!product.getActive()) {
            throw new BadRequestException("Product is inactive and cannot be purchased");
        }

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock. Only " + product.getStockQuantity() + " items available.");
        }

        // Check if item is already in the cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + quantity;
            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Insufficient stock. Cannot add " + quantity + " more. Already in cart: " + existingItem.getQuantity());
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cart.getItems().add(cartItem);
            cartItemRepository.save(cartItem);
        }

        return cartRepository.save(cart);
    }

    @Override
    public Cart updateItemQuantity(String email, Long itemId, Integer quantity) {
        if (quantity <= 0) {
            return removeItemFromCart(email, itemId);
        }

        Cart cart = getCartByUserEmail(email);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Access denied. Item does not belong to your cart.");
        }

        Product product = item.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock. Only " + product.getStockQuantity() + " items available.");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return cartRepository.save(cart);
    }

    @Override
    public Cart removeItemFromCart(String email, Long itemId) {
        Cart cart = getCartByUserEmail(email);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Access denied. Item does not belong to your cart.");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return cartRepository.save(cart);
    }

    @Override
    public void clearCart(String email) {
        Cart cart = getCartByUserEmail(email);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
