package com.pulsecart.controller;

import com.pulsecart.dto.MessageResponse;
import com.pulsecart.dto.ProductDto;
import com.pulsecart.exception.ResourceNotFoundException;
import com.pulsecart.model.User;
import com.pulsecart.repository.UserRepository;
import com.pulsecart.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ProductDto>> getMyRecommendations(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(List.of());
        }
        String email = authentication.getName();
        List<ProductDto> recommendations = recommendationService.getRecommendationsForUser(email).stream()
                .map(rec -> new ProductDto(rec.getProduct(), rec.getExplanation()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/recompute")
    public ResponseEntity<MessageResponse> recomputeMyRecommendations(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        recommendationService.generateRecommendationsForUser(user.getId());
        return ResponseEntity.ok(new MessageResponse("Your personalized recommendations have been recomputed successfully!"));
    }

    @PostMapping("/regenerate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> regenerateAllRecommendations() {
        recommendationService.regenerateAllRecommendations();
        return ResponseEntity.ok(new MessageResponse("All user recommendations regenerated successfully!"));
    }
}
