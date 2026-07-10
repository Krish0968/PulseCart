package com.pulsecart.service;

import com.pulsecart.model.Category;
import com.pulsecart.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {
    List<Category> getAllCategories();
    Page<Product> getActiveProducts(Pageable pageable);
    Page<Product> getActiveProductsByCategory(String categorySlug, Pageable pageable);
    Product getProductBySlug(String slug);
    Product getProductById(Long id);
}
