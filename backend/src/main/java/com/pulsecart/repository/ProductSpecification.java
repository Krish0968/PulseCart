package com.pulsecart.repository;

import com.pulsecart.model.Product;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterProducts(
            String keyword,
            String categorySlug,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minRating,
            Boolean inStock) {

        return (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always only active products
            predicates.add(cb.isTrue(root.get("active")));

            // Keyword search: matches name, description, brand, or category name
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";

                Join<Object, Object> categoryJoin = root.join("category", JoinType.LEFT);

                Predicate namePredicate = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate descPredicate = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate brandPredicate = cb.like(cb.lower(root.get("brand")), searchPattern);
                Predicate categoryPredicate = cb.like(cb.lower(categoryJoin.get("name")), searchPattern);

                predicates.add(cb.or(namePredicate, descPredicate, brandPredicate, categoryPredicate));
            }

            // Category Filter
            if (categorySlug != null && !categorySlug.trim().isEmpty()) {
                Join<Object, Object> categoryJoin = root.join("category", JoinType.INNER);
                predicates.add(cb.equal(categoryJoin.get("slug"), categorySlug));
            }

            // Brand Filter
            if (brand != null && !brand.trim().isEmpty() && !"All".equalsIgnoreCase(brand)) {
                predicates.add(cb.equal(root.get("brand"), brand));
            }

            // Price Filters
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // Rating Filter
            if (minRating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), minRating));
            }

            // In Stock Filter
            if (inStock != null && inStock) {
                predicates.add(cb.greaterThan(root.get("stockQuantity"), 0));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
