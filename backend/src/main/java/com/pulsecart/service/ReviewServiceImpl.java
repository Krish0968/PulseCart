package com.pulsecart.service;

import com.pulsecart.exception.BadRequestException;
import com.pulsecart.exception.ResourceNotFoundException;
import com.pulsecart.model.Product;
import com.pulsecart.model.Review;
import com.pulsecart.model.User;
import com.pulsecart.model.UserInteraction;
import com.pulsecart.repository.OrderRepository;
import com.pulsecart.repository.ProductRepository;
import com.pulsecart.repository.ReviewRepository;
import com.pulsecart.repository.UserRepository;
import com.pulsecart.repository.InteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InteractionRepository interactionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Override
    public Review addReview(String email, Long productId, Integer rating, String reviewText) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Enforce purchase validation
        boolean hasPurchased = orderRepository.existsByUserIdAndProductId(user.getId(), productId);
        if (!hasPurchased) {
            throw new BadRequestException("You must purchase this product before writing a review.");
        }

        // Enforce one review per user per product
        boolean alreadyReviewed = reviewRepository.existsByUserIdAndProductId(user.getId(), productId);
        if (alreadyReviewed) {
            throw new BadRequestException("You have already reviewed this product.");
        }

        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(rating);
        review.setReviewText(reviewText);
        Review savedReview = reviewRepository.save(review);

        // Recalculate average rating & review count for this product
        recalculateProductRating(product);

        // Log RATING interaction
        try {
            UserInteraction interaction = new UserInteraction();
            interaction.setUser(user);
            interaction.setProduct(product);
            interaction.setInteractionType("RATING");
            interaction.setWeight(rating); // rating value serves as interaction weight
            interactionRepository.save(interaction);
        } catch (Exception e) {
            // ignore interaction logging failure
        }

        return savedReview;
    }

    @Override
    public void deleteReview(String email, Long reviewId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
        if (!review.getUser().getId().equals(user.getId()) && !isAdmin) {
            throw new BadRequestException("You do not have permission to delete this review.");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);

        // Recalculate product rating
        recalculateProductRating(product);
    }

    @Override
    public Review updateReview(String email, Long reviewId, Integer rating, String reviewText) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to edit this review.");
        }

        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        review.setRating(rating);
        review.setReviewText(reviewText);
        Review updatedReview = reviewRepository.save(review);

        // Recalculate average rating & review count for this product
        recalculateProductRating(review.getProduct());

        return updatedReview;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUserPurchasedProduct(String email, Long productId) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;
        return orderRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    private void recalculateProductRating(Product product) {
        List<Review> productReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        int reviewCount = productReviews.size();
        double averageRating = 0.0;

        if (reviewCount > 0) {
            double total = productReviews.stream().mapToDouble(Review::getRating).sum();
            averageRating = total / reviewCount;
        }

        product.setReviewCount(reviewCount);
        product.setAverageRating(averageRating);
        productRepository.save(product);
    }
}
