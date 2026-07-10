package com.pulsecart.dto;

import com.pulsecart.model.Category;

public class CategoryDto {
    private Long id;
    private String name;
    private String slug;
    private String description;

    public CategoryDto() {}

    public CategoryDto(Category category) {
        if (category != null) {
            this.id = category.getId();
            this.name = category.getName();
            this.slug = category.getSlug();
            this.description = category.getDescription();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
