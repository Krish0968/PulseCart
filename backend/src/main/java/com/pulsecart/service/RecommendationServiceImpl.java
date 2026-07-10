package com.pulsecart.service;

import com.pulsecart.exception.ResourceNotFoundException;
import com.pulsecart.model.*;
import com.pulsecart.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecommendationServiceImpl implements RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InteractionRepository interactionRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    @Transactional
    public List<UserRecommendation> getRecommendationsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        List<UserRecommendation> recs = recommendationRepository.findByUserIdOrderByScoreDesc(user.getId());

        // If empty (cold start or first load), generate on-the-fly!
        if (recs.isEmpty()) {
            generateRecommendationsForUser(user.getId());
            recs = recommendationRepository.findByUserIdOrderByScoreDesc(user.getId());
        }

        return recs;
    }

    @Override
    @Transactional
    public void generateRecommendationsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Delete existing recommendations
        recommendationRepository.deleteByUserId(userId);

        List<UserInteraction> interactions = interactionRepository.findByUserId(userId);

        if (interactions.isEmpty()) {
            generateColdStartRecommendations(user);
            return;
        }

        // Calculate Category and Brand Affinities based on interaction weights
        Map<Long, Double> categoryAffinities = new HashMap<>();
        Map<String, Double> brandAffinities = new HashMap<>();

        for (UserInteraction interaction : interactions) {
            Product product = interaction.getProduct();
            if (product == null) continue;

            double weight = interaction.getWeight();

            // Category Affinity
            if (product.getCategory() != null) {
                Long catId = product.getCategory().getId();
                categoryAffinities.put(catId, categoryAffinities.getOrDefault(catId, 0.0) + weight);
            }

            // Brand Affinity
            String brand = product.getBrand();
            if (brand != null) {
                brandAffinities.put(brand, brandAffinities.getOrDefault(brand, 0.0) + weight);
            }
        }

        double maxCategoryWeight = categoryAffinities.values().stream().max(Double::compare).orElse(1.0);
        double maxBrandWeight = brandAffinities.values().stream().max(Double::compare).orElse(1.0);

        // Fetch all active products
        List<Product> candidates = productRepository.findAll().stream()
                .filter(Product::getActive)
                .filter(p -> p.getStockQuantity() > 0)
                // Filter out already purchased products to keep recommendations fresh!
                .filter(p -> !orderRepository.existsByUserIdAndProductId(userId, p.getId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            // Fallback to active catalog
            candidates = productRepository.findAll().stream()
                    .filter(Product::getActive)
                    .collect(Collectors.toList());
        }

        // Get max review count for popularity normalization
        double maxReviews = candidates.stream()
                .mapToDouble(Product::getReviewCount)
                .max()
                .orElse(1.0);
        if (maxReviews == 0) maxReviews = 1.0;

        // Max ID for recency normalization
        double maxId = candidates.stream()
                .mapToDouble(Product::getId)
                .max()
                .orElse(1.0);

        List<UserRecommendation> recommendations = new ArrayList<>();

        for (Product product : candidates) {
            // Category Affinity Score (Normalized)
            double catScore = 0.0;
            if (product.getCategory() != null) {
                catScore = categoryAffinities.getOrDefault(product.getCategory().getId(), 0.0) / maxCategoryWeight;
            }

            // Brand Affinity Score (Normalized)
            double brandScore = brandAffinities.getOrDefault(product.getBrand(), 0.0) / maxBrandWeight;

            // Popularity Score (Normalized)
            double popScore = product.getReviewCount() / maxReviews;

            // Average Rating Score (Normalized out of 5.0 stars)
            double ratingScore = product.getAverageRating() / 5.0;

            // Recency Score (Normalized based on ID)
            double recencyScore = product.getId() / maxId;

            // Hybrid Recommendation scoring formula
            double finalScore = 0.45 * catScore
                              + 0.20 * brandScore
                              + 0.15 * popScore
                              + 0.10 * ratingScore
                              + 0.10 * recencyScore;

            // Determine dynamic explanation label
            String explanation = "Recommended Product";
            if (catScore >= brandScore && catScore >= 0.2 && product.getCategory() != null) {
                explanation = "Because you viewed " + product.getCategory().getName();
            } else if (brandScore > catScore && brandScore >= 0.2) {
                explanation = "Based on your interest in " + product.getBrand();
            } else if (ratingScore >= 0.8) {
                explanation = "Highly rated in Store";
            } else if (popScore >= 0.5) {
                explanation = "Trending Product";
            }

            UserRecommendation rec = new UserRecommendation();
            rec.setUser(user);
            rec.setProduct(product);
            rec.setScore(finalScore);
            rec.setExplanation(explanation);
            recommendations.add(rec);
        }

        // Sort by score descending and save top 8
        recommendations.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        List<UserRecommendation> topRecs = recommendations.stream().limit(8).collect(Collectors.toList());

        recommendationRepository.saveAll(topRecs);
    }

    @Override
    @Transactional
    public void regenerateAllRecommendations() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            // Don't generate recommendations for admin to save computation resources
            boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
            if (!isAdmin) {
                generateRecommendationsForUser(user.getId());
            }
        }
    }

    private void generateColdStartRecommendations(User user) {
        // Cold start strategy: retrieve top rated/popular items in active catalog
        List<Product> activeProducts = productRepository.findAll().stream()
                .filter(Product::getActive)
                .filter(p -> p.getStockQuantity() > 0)
                .collect(Collectors.toList());

        // Sort by average rating and review count
        activeProducts.sort((a, b) -> {
            int ratingCompare = Double.compare(b.getAverageRating(), a.getAverageRating());
            if (ratingCompare != 0) return ratingCompare;
            return Integer.compare(b.getReviewCount(), a.getReviewCount());
        });

        List<Product> topProducts = activeProducts.stream().limit(8).collect(Collectors.toList());

        List<UserRecommendation> coldRecs = new ArrayList<>();
        for (Product product : topProducts) {
            String explanation = product.getAverageRating() >= 4.5 ? "Highly Rated" : "Trending Product";

            UserRecommendation rec = new UserRecommendation();
            rec.setUser(user);
            rec.setProduct(product);
            rec.setScore(1.0); // baseline score for cold start
            rec.setExplanation(explanation);
            coldRecs.add(rec);
        }

        recommendationRepository.saveAll(coldRecs);
    }
}
