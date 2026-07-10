package com.pulsecart.service;

import com.pulsecart.model.Cart;

public interface CartService {
    Cart getCartByUserEmail(String email);
    Cart addItemToCart(String email, Long productId, Integer quantity);
    Cart updateItemQuantity(String email, Long itemId, Integer quantity);
    Cart removeItemFromCart(String email, Long itemId);
    void clearCart(String email);
}
