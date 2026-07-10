package com.pulsecart.controller;

import com.pulsecart.dto.MessageResponse;
import com.pulsecart.dto.ReviewDto;
import com.pulsecart.dto.ReviewRequest;
import com.pulsecart.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDto>> getReviews(@PathVariable Long productId) {
        List<ReviewDto> reviews = reviewService.getReviewsByProduct(productId).stream()
                .map(ReviewDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<ReviewDto> addReview(Authentication authentication, @Valid @RequestBody ReviewRequest request) {
        String email = authentication.getName();
        ReviewDto reviewDto = new ReviewDto(reviewService.addReview(
                email,
                request.getProductId(),
                request.getRating(),
                request.getReviewText()
        ));
        return ResponseEntity.ok(reviewDto);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<MessageResponse> deleteReview(Authentication authentication, @PathVariable Long reviewId) {
        String email = authentication.getName();
        reviewService.deleteReview(email, reviewId);
        return ResponseEntity.ok(new MessageResponse("Review deleted successfully!"));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewDto> updateReview(Authentication authentication, @PathVariable Long reviewId, @Valid @RequestBody ReviewRequest request) {
        String email = authentication.getName();
        ReviewDto reviewDto = new ReviewDto(reviewService.updateReview(
                email,
                reviewId,
                request.getRating(),
                request.getReviewText()
        ));
        return ResponseEntity.ok(reviewDto);
    }

    @GetMapping("/product/{productId}/check-purchase")
    public ResponseEntity<Boolean> checkProductPurchase(Authentication authentication, @PathVariable Long productId) {
        if (authentication == null) {
            return ResponseEntity.ok(false);
        }
        String email = authentication.getName();
        return ResponseEntity.ok(reviewService.hasUserPurchasedProduct(email, productId));
    }
}
