package com.pulsecart.scheduler;

import com.pulsecart.service.RecommendationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RecommendationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationScheduler.class);

    @Autowired
    private RecommendationService recommendationService;

    // Run every 2 hours by default, or as configured by recommendation.cron property
    @Scheduled(cron = "${recommendation.cron:0 0 */2 * * *}")
    public void runRecommendationRegeneration() {
        logger.info("Starting local fallback scheduled recommendation regeneration task...");
        try {
            recommendationService.regenerateAllRecommendations();
            logger.info("Local fallback scheduled recommendation regeneration completed successfully!");
        } catch (Exception e) {
            logger.error("Failed to run scheduled recommendation regeneration: {}", e.getMessage(), e);
        }
    }
}
