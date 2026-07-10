package com.pulsecart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InteractionRequest {
    @NotNull
    private Long productId;

    @NotBlank
    private String interactionType;

    private Integer weight;

    public InteractionRequest() {}

    public InteractionRequest(Long productId, String interactionType, Integer weight) {
        this.productId = productId;
        this.interactionType = interactionType;
        this.weight = weight;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getInteractionType() {
        return interactionType;
    }

    public void setInteractionType(String interactionType) {
        this.interactionType = interactionType;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }
}
