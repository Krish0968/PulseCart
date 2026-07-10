package com.pulsecart.service;

import com.pulsecart.model.Review;
import java.util.List;

public interface ReviewService {
    List<Review> getReviewsByProduct(Long productId);
    Review addReview(String email, Long productId, Integer rating, String reviewText);
    Review updateReview(String email, Long reviewId, Integer rating, String reviewText);
    void deleteReview(String email, Long reviewId);
    boolean hasUserPurchasedProduct(String email, Long productId);
}
