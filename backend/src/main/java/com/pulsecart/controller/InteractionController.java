package com.pulsecart.controller;

import com.pulsecart.dto.InteractionRequest;
import com.pulsecart.dto.MessageResponse;
import com.pulsecart.model.Product;
import com.pulsecart.model.User;
import com.pulsecart.model.UserInteraction;
import com.pulsecart.repository.InteractionRepository;
import com.pulsecart.repository.ProductRepository;
import com.pulsecart.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/interactions")
@CrossOrigin(origins = "*")
public class InteractionController {

    @Autowired
    private InteractionRepository interactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping
    public ResponseEntity<MessageResponse> logInteraction(Authentication authentication, @Valid @RequestBody InteractionRequest request) {
        if (authentication == null) {
            return ResponseEntity.ok(new MessageResponse("Interaction skipped: anonymous user"));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Product not found"));
        }

        int weight = request.getWeight() != null ? request.getWeight() : getWeightForType(request.getInteractionType());

        UserInteraction interaction = new UserInteraction();
        interaction.setUser(user);
        interaction.setProduct(product);
        interaction.setInteractionType(request.getInteractionType().toUpperCase());
        interaction.setWeight(weight);
        interaction.setCreatedAt(LocalDateTime.now());

        interactionRepository.save(interaction);

        return ResponseEntity.ok(new MessageResponse("Interaction logged successfully"));
    }

    private int getWeightForType(String type) {
        if (type == null) return 1;
        switch (type.toUpperCase()) {
            case "PRODUCT_VIEW":
            case "SEARCH":
                return 1;
            case "ADD_TO_CART":
                return 3;
            case "PURCHASE":
                return 5;
            default:
                return 1;
        }
    }
}
