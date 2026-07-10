package com.pulsecart.dto;

import com.pulsecart.model.Cart;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CartDto {
    private Long id;
    private List<CartItemDto> items = new ArrayList<>();
    private BigDecimal totalPrice = BigDecimal.ZERO;

    public CartDto() {}

    public CartDto(Cart cart) {
        if (cart != null) {
            this.id = cart.getId();
            if (cart.getItems() != null) {
                this.items = cart.getItems().stream()
                        .map(CartItemDto::new)
                        .collect(Collectors.toList());

                this.totalPrice = this.items.stream()
                        .map(item -> {
                            BigDecimal itemPrice = item.getDiscountPrice() != null ? item.getDiscountPrice() : item.getPrice();
                            return itemPrice.multiply(new BigDecimal(item.getQuantity()));
                        })
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<CartItemDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemDto> items) {
        this.items = items;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}
