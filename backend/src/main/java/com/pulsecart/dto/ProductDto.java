package com.pulsecart.dto;

import com.pulsecart.model.Product;
import java.math.BigDecimal;

public class ProductDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private String categoryName;
    private String categorySlug;
    private String brand;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer stockQuantity;
    private String imageUrl;
    private Boolean active;
    private Double averageRating;
    private Integer reviewCount;
    private String explanation;

    public ProductDto() {}

    public ProductDto(Product product) {
        if (product != null) {
            this.id = product.getId();
            this.name = product.getName();
            this.slug = product.getSlug();
            this.description = product.getDescription();
            this.shortDescription = product.getShortDescription();
            if (product.getCategory() != null) {
                this.categoryName = product.getCategory().getName();
                this.categorySlug = product.getCategory().getSlug();
            }
            this.brand = product.getBrand();
            this.price = product.getPrice();
            this.discountPrice = product.getDiscountPrice();
            this.stockQuantity = product.getStockQuantity();
            this.imageUrl = product.getImageUrl();
            this.active = product.getActive();
            this.averageRating = product.getAverageRating();
            this.reviewCount = product.getReviewCount();
        }
    }

    public ProductDto(Product product, String explanation) {
        this(product);
        this.explanation = explanation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategorySlug() {
        return categorySlug;
    }

    public void setCategorySlug(String categorySlug) {
        this.categorySlug = categorySlug;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
