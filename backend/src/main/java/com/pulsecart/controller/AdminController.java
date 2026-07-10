package com.pulsecart.controller;

import com.pulsecart.dto.*;
import com.pulsecart.exception.BadRequestException;
import com.pulsecart.exception.ResourceNotFoundException;
import com.pulsecart.model.Category;
import com.pulsecart.model.Order;
import com.pulsecart.model.Product;
import com.pulsecart.repository.CategoryRepository;
import com.pulsecart.repository.OrderRepository;
import com.pulsecart.repository.ProductRepository;
import com.pulsecart.repository.UserRepository;
import com.pulsecart.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageService storageService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getDashboardStats() {
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_CUSTOMER".equals(r.getName())))
                .count();

        List<ProductDto> lowStock = productRepository.findAll().stream()
                .filter(Product::getActive)
                .filter(p -> p.getStockQuantity() <= 5)
                .map(ProductDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new AdminStatsDto(totalRevenue, totalOrders, totalProducts, totalCustomers, lowStock));
    }

    // --- Image Upload ---
    @PostMapping("/products/upload")
    public ResponseEntity<Map<String, String>> uploadProductImage(@RequestParam("file") MultipartFile file) {
        String fileUrl = storageService.storeFile(file);
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", fileUrl);
        return ResponseEntity.ok(response);
    }

    // --- Product CRUD ---
    @PostMapping("/products")
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Product name is required");
        }

        Category category = categoryRepository.findBySlug(dto.getCategorySlug())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + dto.getCategorySlug()));

        // Generate unique slug
        String slug = dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (productRepository.findBySlug(slug).isPresent()) {
            slug += "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        Product product = new Product();
        product.setName(dto.getName());
        product.setSlug(slug);
        product.setDescription(dto.getDescription());
        product.setShortDescription(dto.getShortDescription());
        product.setCategory(category);
        product.setBrand(dto.getBrand());
        product.setPrice(dto.getPrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        product.setActive(true);
        product.setAverageRating(0.0);
        product.setReviewCount(0);

        Product saved = productRepository.save(product);
        return ResponseEntity.ok(new ProductDto(saved));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        Category category = categoryRepository.findBySlug(dto.getCategorySlug())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + dto.getCategorySlug()));

        // If name changes, regenerate slug
        if (!product.getName().equalsIgnoreCase(dto.getName())) {
            String slug = dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
            if (productRepository.findBySlug(slug).isPresent()) {
                slug += "-" + UUID.randomUUID().toString().substring(0, 4);
            }
            product.setSlug(slug);
        }

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setShortDescription(dto.getShortDescription());
        product.setCategory(category);
        product.setBrand(dto.getBrand());
        product.setPrice(dto.getPrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        if (dto.getActive() != null) {
            product.setActive(dto.getActive());
        }

        Product saved = productRepository.save(product);
        return ResponseEntity.ok(new ProductDto(saved));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<MessageResponse> deleteProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Soft delete to avoid breaking order integrity!
        product.setActive(false);
        productRepository.save(product);

        return ResponseEntity.ok(new MessageResponse("Product deactivated successfully (Soft Deleted)"));
    }

    // --- Category CRUD ---
    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Category name is required");
        }

        String slug = dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (categoryRepository.findBySlug(slug).isPresent()) {
            slug += "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        Category category = new Category();
        category.setName(dto.getName());
        category.setSlug(slug);
        category.setDescription(dto.getDescription());

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(new CategoryDto(saved));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @RequestBody CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (!category.getName().equalsIgnoreCase(dto.getName())) {
            String slug = dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
            if (categoryRepository.findBySlug(slug).isPresent()) {
                slug += "-" + UUID.randomUUID().toString().substring(0, 4);
            }
            category.setSlug(slug);
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(new CategoryDto(saved));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<MessageResponse> deleteCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        categoryRepository.delete(category);
        return ResponseEntity.ok(new MessageResponse("Category deleted successfully"));
    }

    // --- Order Fulfilment Management ---
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        List<OrderDto> orders = orderRepository.findAllWithItemsAndProducts().stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        String status = payload.get("status");
        if (status == null || status.trim().isEmpty()) {
            throw new BadRequestException("Status is required");
        }

        order.setStatus(status.toUpperCase());
        orderRepository.save(order);

        Order updated = orderRepository.findByIdWithItemsAndProducts(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        return ResponseEntity.ok(new OrderDto(updated));
    }
}
