package com.pulsecart.dto;

import com.pulsecart.model.Review;
import java.time.LocalDateTime;

public class ReviewDto {
    private Long id;
    private String userEmail;
    private String userFirstName;
    private String userLastName;
    private Long productId;
    private String productName;
    private Integer rating;
    private String reviewText;
    private LocalDateTime createdAt;

    public ReviewDto() {}

    public ReviewDto(Review review) {
        if (review != null) {
            this.id = review.getId();
            if (review.getUser() != null) {
                this.userEmail = review.getUser().getEmail();
                this.userFirstName = review.getUser().getFirstName();
                this.userLastName = review.getUser().getLastName();
            }
            if (review.getProduct() != null) {
                this.productId = review.getProduct().getId();
                this.productName = review.getProduct().getName();
            }
            this.rating = review.getRating();
            this.reviewText = review.getReviewText();
            this.createdAt = review.getCreatedAt();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserFirstName() {
        return userFirstName;
    }

    public void setUserFirstName(String userFirstName) {
        this.userFirstName = userFirstName;
    }

    public String getUserLastName() {
        return userLastName;
    }

    public void setUserLastName(String userLastName) {
        this.userLastName = userLastName;
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

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getReviewText() {
        return reviewText;
    }

    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
