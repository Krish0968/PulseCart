package com.pulsecart.controller;

import com.pulsecart.dto.CategoryDto;
import com.pulsecart.dto.ProductDto;
import com.pulsecart.model.Product;
import com.pulsecart.repository.ProductRepository;
import com.pulsecart.repository.ProductSpecification;
import com.pulsecart.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        List<CategoryDto> categories = productService.getAllCategories().stream()
                .map(CategoryDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/products")
    public ResponseEntity<Page<ProductDto>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDto> products = productService.getActiveProducts(pageable).map(ProductDto::new);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/category/{categorySlug}")
    public ResponseEntity<Page<ProductDto>> getProductsByCategory(
            @PathVariable String categorySlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDto> products = productService.getActiveProductsByCategory(categorySlug, pageable).map(ProductDto::new);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{slug}")
    public ResponseEntity<ProductDto> getProductDetails(@PathVariable String slug) {
        ProductDto productDto = new ProductDto(productService.getProductBySlug(slug));
        return ResponseEntity.ok(productDto);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDto>> searchProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Sort sortOrder = Sort.by("createdAt").descending(); // default
        if ("price_asc".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by("price").ascending();
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by("price").descending();
        } else if ("rating".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by("averageRating").descending();
        } else if ("popularity".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by("reviewCount").descending();
        }

        Pageable pageable = PageRequest.of(page, size, sortOrder);
        Specification<Product> spec = ProductSpecification.filterProducts(
                q, category, brand, minPrice, maxPrice, minRating, inStock);

        Page<ProductDto> searchResults = productRepository.findAll(spec, pageable).map(ProductDto::new);
        return ResponseEntity.ok(searchResults);
    }
}
