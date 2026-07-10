package com.pulsecart.dto;

import com.pulsecart.model.CartItem;
import java.math.BigDecimal;

public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String productBrand;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer quantity;
    private Integer stockQuantity;
    private String imageUrl;
    private ProductInfo product;

    public static class ProductInfo {
        private Long id;
        private String productName;
        private String productSlug;
        private String productBrand;
        private BigDecimal price;
        private BigDecimal discountPrice;
        private Integer stockQuantity;
        private String imageUrl;

        public ProductInfo() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public String getProductSlug() { return productSlug; }
        public void setProductSlug(String productSlug) { this.productSlug = productSlug; }

        public String getProductBrand() { return productBrand; }
        public void setProductBrand(String productBrand) { this.productBrand = productBrand; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public BigDecimal getDiscountPrice() { return discountPrice; }
        public void setDiscountPrice(BigDecimal discountPrice) { this.discountPrice = discountPrice; }

        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public CartItemDto() {}

    public CartItemDto(CartItem item) {
        if (item != null) {
            this.id = item.getId();
            this.quantity = item.getQuantity();
            if (item.getProduct() != null) {
                this.productId = item.getProduct().getId();
                this.productName = item.getProduct().getName();
                this.productSlug = item.getProduct().getSlug();
                this.productBrand = item.getProduct().getBrand();
                this.price = item.getProduct().getPrice();
                this.discountPrice = item.getProduct().getDiscountPrice();
                this.stockQuantity = item.getProduct().getStockQuantity();
                this.imageUrl = item.getProduct().getImageUrl();

                // Eagerly map nested product details required by the frontend client
                this.product = new ProductInfo();
                this.product.setId(item.getProduct().getId());
                this.product.setProductName(item.getProduct().getName());
                this.product.setProductSlug(item.getProduct().getSlug());
                this.product.setProductBrand(item.getProduct().getBrand());
                this.product.setPrice(item.getProduct().getPrice());
                this.product.setDiscountPrice(item.getProduct().getDiscountPrice());
                this.product.setStockQuantity(item.getProduct().getStockQuantity());
                this.product.setImageUrl(item.getProduct().getImageUrl());
            }
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductSlug() {
        return productSlug;
    }

    public void setProductSlug(String productSlug) {
        this.productSlug = productSlug;
    }

    public String getProductBrand() {
        return productBrand;
    }

    public void setProductBrand(String productBrand) {
        this.productBrand = productBrand;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getDiscountPrice() {
        return discountPrice;
    }

    public void setDiscountPrice(BigDecimal discountPrice) {
        this.discountPrice = discountPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public ProductInfo getProduct() {
        return product;
    }

    public void setProduct(ProductInfo product) {
        this.product = product;
    }
}
