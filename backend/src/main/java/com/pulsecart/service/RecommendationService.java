package com.pulsecart.service;

import com.pulsecart.model.UserRecommendation;
import java.util.List;

public interface RecommendationService {
    List<UserRecommendation> getRecommendationsForUser(String email);
    void generateRecommendationsForUser(Long userId);
    void regenerateAllRecommendations();
}
