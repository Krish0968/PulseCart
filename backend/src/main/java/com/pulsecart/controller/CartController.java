package com.pulsecart.controller;

import com.pulsecart.dto.CartDto;
import com.pulsecart.dto.CartItemRequest;
import com.pulsecart.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartDto> getCart(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(new CartDto(cartService.getCartByUserEmail(email)));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto> addItemToCart(Authentication authentication, @RequestBody CartItemRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(new CartDto(cartService.addItemToCart(email, request.getProductId(), request.getQuantity())));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateItemQuantity(Authentication authentication, @PathVariable Long itemId, @RequestBody CartItemRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(new CartDto(cartService.updateItemQuantity(email, itemId, request.getQuantity())));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeItemFromCart(Authentication authentication, @PathVariable Long itemId) {
        String email = authentication.getName();
        return ResponseEntity.ok(new CartDto(cartService.removeItemFromCart(email, itemId)));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        String email = authentication.getName();
        cartService.clearCart(email);
        return ResponseEntity.ok().build();
    }
}
