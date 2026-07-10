package com.pulsecart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulsecart.dto.*;
import com.pulsecart.model.*;
import com.pulsecart.repository.*;
import com.pulsecart.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.flyway.enabled=false",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
@AutoConfigureMockMvc
@Transactional
public class StorefrontIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testCustomer;
    private User testAdmin;
    private Role customerRole;
    private Role adminRole;

    @BeforeEach
    public void setup() {
        // Seed roles if missing
        customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_CUSTOMER")));
        adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_ADMIN")));

        // Create Admin user
        testAdmin = userRepository.findByEmail("admin@pulsecart.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("admin@pulsecart.com");
            u.setPassword(passwordEncoder.encode("password"));
            u.setFirstName("Admin");
            u.setLastName("User");
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            u.setRoles(roles);
            return userRepository.save(u);
        });

        // Create Customer user
        testCustomer = userRepository.findByEmail("customer@pulsecart.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("customer@pulsecart.com");
            u.setPassword(passwordEncoder.encode("password"));
            u.setFirstName("Customer");
            u.setLastName("User");
            Set<Role> roles = new HashSet<>();
            roles.add(customerRole);
            u.setRoles(roles);
            
            // Auto-create cart for customer
            User saved = userRepository.save(u);
            Cart c = new Cart();
            c.setUser(saved);
            cartRepository.save(c);
            return saved;
        });
    }

    private String getJwtToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JwtResponse jwtResponse = objectMapper.readValue(responseBody, JwtResponse.class);
        return jwtResponse.getToken();
    }

    @Test
    public void testAuthenticationFlow() throws Exception {
        // 1. Success signup
        SignupRequest signup = new SignupRequest();
        signup.setEmail("new-user@pulsecart.com");
        signup.setPassword("password");
        signup.setFirstName("New");
        signup.setLastName("User");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        // 2. Success signin
        String token = getJwtToken("new-user@pulsecart.com", "password");
        assertNotNull(token);

        // 3. Failed signin (invalid password)
        LoginRequest badLogin = new LoginRequest();
        badLogin.setEmail("new-user@pulsecart.com");
        badLogin.setPassword("wrong-pass");

        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testCartAndCheckoutFlow() throws Exception {
        String token = getJwtToken("customer@pulsecart.com", "password");
        
        // Find seeded laptop
        Product laptop = productRepository.findAll().stream()
                .filter(Product::getActive)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed products not found!"));

        int initialStock = laptop.getStockQuantity();

        // 1. Add to cart
        CartItemRequest addReq = new CartItemRequest(laptop.getId(), 2);
        mockMvc.perform(post("/api/cart/items")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].productName").value(laptop.getName()))
                .andExpect(jsonPath("$.items[0].quantity").value(2));

        // 2. Checkout successfully
        CheckoutRequest checkReq = new CheckoutRequest();
        checkReq.setShippingAddress("123 Test St, Seattle, WA");
        checkReq.setPaymentMethod("CREDIT_CARD");
        checkReq.setMockPaymentStatus("SUCCESS");

        mockMvc.perform(post("/api/checkout")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.paymentStatus").value("PAID"));

        // Verify stock depletion
        Product updatedLaptop = productRepository.findById(laptop.getId()).get();
        assertEquals(initialStock - 2, updatedLaptop.getStockQuantity());

        // 3. Try checking out empty cart (expect 400)
        mockMvc.perform(post("/api/checkout")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testReviewsRestrictions() throws Exception {
        String token = getJwtToken("customer@pulsecart.com", "password");

        Product laptop = productRepository.findAll().stream()
                .filter(Product::getActive)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed products not found!"));

        // Try writing review without purchasing (expect 400)
        ReviewRequest reviewReq = new ReviewRequest(laptop.getId(), 5, "I love this product!");
        mockMvc.perform(post("/api/reviews")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isBadRequest());

        // Buy product
        // Add to cart
        CartItemRequest addReq = new CartItemRequest(laptop.getId(), 1);
        mockMvc.perform(post("/api/cart/items")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk());

        // Checkout
        CheckoutRequest checkReq = new CheckoutRequest("999 Way, Seattle, WA", "PAYPAL", "SUCCESS");
        mockMvc.perform(post("/api/checkout")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkReq)))
                .andExpect(status().isOk());

        // Write review now (should succeed)
        MvcResult addResult = mockMvc.perform(post("/api/reviews")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.reviewText").value("I love this product!"))
                .andReturn();

        String addBody = addResult.getResponse().getContentAsString();
        ReviewDto savedReview = objectMapper.readValue(addBody, ReviewDto.class);
        Long reviewId = savedReview.getId();

        // Fetch submitted review and verify properties
        mockMvc.perform(get("/api/reviews/product/" + laptop.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userFirstName").value("Customer"))
                .andExpect(jsonPath("$[0].rating").value(5))
                .andExpect(jsonPath("$[0].reviewText").value("I love this product!"));

        // Try duplicate review (expect 400)
        mockMvc.perform(post("/api/reviews")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isBadRequest());

        // Create another customer user to test unauthorized edits
        SignupRequest signup2 = new SignupRequest();
        signup2.setEmail("bob-review@example.com");
        signup2.setPassword("password");
        signup2.setFirstName("Bob");
        signup2.setLastName("Review");
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signup2)))
                .andExpect(status().isOk());
        String otherToken = getJwtToken("bob-review@example.com", "password");

        // Edit review by non-owner -> 400 Bad Request
        ReviewRequest editReq = new ReviewRequest(laptop.getId(), 4, "Actually it is ok.");
        mockMvc.perform(put("/api/reviews/" + reviewId)
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editReq)))
                .andExpect(status().isBadRequest());

        // Delete review by non-owner -> 400 Bad Request
        mockMvc.perform(delete("/api/reviews/" + reviewId)
                .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isBadRequest());

        // Edit review by owner -> 200 OK
        mockMvc.perform(put("/api/reviews/" + reviewId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.reviewText").value("Actually it is ok."));

        // Verify product average rating recalculation
        Product updatedProduct = productRepository.findById(laptop.getId()).get();
        assertEquals(4.0, updatedProduct.getAverageRating());
        assertEquals(1, updatedProduct.getReviewCount());

        // Delete review by owner -> 200 OK
        mockMvc.perform(delete("/api/reviews/" + reviewId)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Verify product average rating recalculated to 0
        Product finalProduct = productRepository.findById(laptop.getId()).get();
        assertEquals(0.0, finalProduct.getAverageRating());
        assertEquals(0, finalProduct.getReviewCount());
    }

    @Test
    public void testSearchAndSpecifications() throws Exception {
        // Search by keyword
        mockMvc.perform(get("/api/search?q=Laptop")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("PulsePro Laptop 15"));

        // Search with price filter (low price limit)
        mockMvc.perform(get("/api/search?q=Laptop&maxPrice=100")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    public void testAdminSecurityAndDashboard() throws Exception {
        // 1. Unauthenticated access remains blocked (returns 403 Forbidden)
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isForbidden());

        // 2. Wrong admin password fails (returns 401 Unauthorized)
        LoginRequest badLogin = new LoginRequest();
        badLogin.setEmail("admin@pulsecart.com");
        badLogin.setPassword("wrong-password");
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());

        // 3. Seeded admin authentication succeeds
        String adminToken = getJwtToken("admin@pulsecart.com", "password");
        assertNotNull(adminToken);

        // 4. Admin JWT loads correct role (access to admin stats is allowed)
        mockMvc.perform(get("/api/admin/stats")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").exists());

        // 5. Customer JWT cannot access admin endpoints (403 Forbidden)
        String customerToken = getJwtToken("customer@pulsecart.com", "password");
        mockMvc.perform(get("/api/admin/stats")
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testRecommendationEngineAndColdStart() throws Exception {
        String token = getJwtToken("customer@pulsecart.com", "password");

        // 1. Fresh user has no views/purchases in H2 -> expect cold start recommendations
        mockMvc.perform(get("/api/recommendations")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].name").exists())
                .andExpect(jsonPath("$[0].slug").exists())
                .andExpect(jsonPath("$[0].price").exists())
                .andExpect(jsonPath("$[0].imageUrl").exists())
                .andExpect(jsonPath("$[0].categoryName").exists())
                .andExpect(jsonPath("$[0].explanation").exists());

        // Log a view interaction
        Product laptop = productRepository.findAll().stream()
                .filter(Product::getActive)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed products not found!"));

        InteractionRequest intReq = new InteractionRequest(laptop.getId(), "PRODUCT_VIEW", 1);
        mockMvc.perform(post("/api/interactions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(intReq)))
                .andExpect(status().isOk());

        // Fetch recommendations again (should run personalization with affinity tags)
        mockMvc.perform(get("/api/recommendations")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").exists())
                .andExpect(jsonPath("$[0].explanation").exists());

        // 2. Create a clean user with no views or history, expect valid HTTP 200 with fallback recommendations
        SignupRequest signup = new SignupRequest();
        signup.setEmail("clean-rec-user@pulsecart.com");
        signup.setPassword("password");
        signup.setFirstName("CleanRec");
        signup.setLastName("User");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk());

        String cleanToken = getJwtToken("clean-rec-user@pulsecart.com", "password");
        mockMvc.perform(get("/api/recommendations")
                .header("Authorization", "Bearer " + cleanToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    public void testGetProductsEndpointAndCategoryData() throws Exception {
        // Find a seeded active product slug for verification
        Product laptop = productRepository.findAll().stream()
                .filter(Product::getActive)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed products not found!"));

        // 1. Verify GET /api/products returns 200 and loads category info properly
        mockMvc.perform(get("/api/products")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].categoryName").isNotEmpty())
                .andExpect(jsonPath("$.content[0].categorySlug").isNotEmpty());

        // 2. Verify GET /api/products/{slug} returns 200 and category info
        mockMvc.perform(get("/api/products/" + laptop.getSlug())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryName").value(laptop.getCategory().getName()))
                .andExpect(jsonPath("$.categorySlug").value(laptop.getCategory().getSlug()));

        // 3. Verify GET /api/search with specifications loads category info
        mockMvc.perform(get("/api/search?q=" + laptop.getName())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].categoryName").value(laptop.getCategory().getName()))
                .andExpect(jsonPath("$.content[0].categorySlug").value(laptop.getCategory().getSlug()));

        // 4. Verify nonexistent numeric product returns 404
        mockMvc.perform(get("/api/products/999999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        // 5. Verify malformed/invalid product ID returns 404
        mockMvc.perform(get("/api/products/abc")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/products/0")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/products/-1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCartAndReviewRegressionEndpoints() throws Exception {
        String token = getJwtToken("customer@pulsecart.com", "password");

        // 1. Clear cart
        mockMvc.perform(delete("/api/cart")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 2. GET /api/cart (empty cart) should return 200 OK with empty items list
        mockMvc.perform(get("/api/cart")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());

        // 3. Add item and check DTO contract details
        Product laptop = productRepository.findAll().stream()
                .filter(Product::getActive)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed products not found!"));

        CartItemRequest addReq = new CartItemRequest(laptop.getId(), 1);
        mockMvc.perform(post("/api/cart/items")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].product.id").value(laptop.getId()))
                .andExpect(jsonPath("$.items[0].product.productName").value(laptop.getName()))
                .andExpect(jsonPath("$.items[0].product.price").exists())
                .andExpect(jsonPath("$.items[0].product.imageUrl").exists())
                .andExpect(jsonPath("$.items[0].product.stockQuantity").exists());

        // 4. GET /api/reviews/product/{id} should return 200 OK with empty list when no reviews exist
        mockMvc.perform(get("/api/reviews/product/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    public void testOrderHistoryRegressionEndpoints() throws Exception {
        // 1. Unauthenticated request to /api/orders should return 403 Forbidden
        mockMvc.perform(get("/api/orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        // 2. Create a brand new user to test empty order history list returns 200 OK with []
        SignupRequest signup = new SignupRequest();
        signup.setEmail("clean-user@pulsecart.com");
        signup.setPassword("password");
        signup.setFirstName("Clean");
        signup.setLastName("User");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk());

        String cleanToken = getJwtToken("clean-user@pulsecart.com", "password");
        mockMvc.perform(get("/api/orders")
                .header("Authorization", "Bearer " + cleanToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        // 3. Authenticated order creation with testCustomer should succeed and appear in history list
        String customerToken = getJwtToken("customer@pulsecart.com", "password");

        // Empty cart check
        mockMvc.perform(delete("/api/cart")
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk());

        // Find active product
        Product laptop = productRepository.findAll().stream()
                .filter(Product::getActive)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed products not found!"));

        // Add to cart
        CartItemRequest addReq = new CartItemRequest(laptop.getId(), 1);
        mockMvc.perform(post("/api/cart/items")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk());

        // Place order
        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setShippingAddress("998 Cascade St, Seattle, WA");
        checkoutReq.setPaymentMethod("CREDIT_CARD");
        checkoutReq.setMockPaymentStatus("SUCCESS");

        mockMvc.perform(post("/api/checkout")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkoutReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // 4. Retrieve order history list, expect 200 OK containing the newly placed order and nested details
        mockMvc.perform(get("/api/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").exists())
                .andExpect(jsonPath("$[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$[0].shippingAddress").value("998 Cascade St, Seattle, WA"))
                .andExpect(jsonPath("$[0].totalAmount").exists())
                .andExpect(jsonPath("$[0].items[0].productId").value(laptop.getId()))
                .andExpect(jsonPath("$[0].items[0].productName").value(laptop.getName()))
                .andExpect(jsonPath("$[0].items[0].productSlug").value(laptop.getSlug()))
                .andExpect(jsonPath("$[0].items[0].imageUrl").exists())
                .andExpect(jsonPath("$[0].items[0].price").exists());
    }

    @Test
    public void testUserProfileAndChangePasswordFlow() throws Exception {
        // 1. Create a fresh user for this test
        SignupRequest signup = new SignupRequest();
        signup.setEmail("profile-user@pulsecart.com");
        signup.setPassword("password");
        signup.setFirstName("Profile");
        signup.setLastName("User");
        signup.setPhone("1234567890");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk());

        String token = getJwtToken("profile-user@pulsecart.com", "password");

        // 2. Fetch profile me details (browser/auth restoration endpoint)
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("profile-user@pulsecart.com"))
                .andExpect(jsonPath("$.firstName").value("Profile"))
                .andExpect(jsonPath("$.lastName").value("User"))
                .andExpect(jsonPath("$.phone").value("1234567890"));

        // 3. Successful profile update persists
        ProfileUpdateRequest updateReq = new ProfileUpdateRequest("NewFirstName", "NewLastName", "9876543210", "profile-new@pulsecart.com");
        MvcResult updateResult = mockMvc.perform(put("/api/users/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.firstName").value("NewFirstName"))
                .andExpect(jsonPath("$.user.lastName").value("NewLastName"))
                .andExpect(jsonPath("$.user.phone").value("9876543210"))
                .andExpect(jsonPath("$.user.email").value("profile-new@pulsecart.com"))
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String responseBody = updateResult.getResponse().getContentAsString();
        ProfileUpdateResponse profileRes = objectMapper.readValue(responseBody, ProfileUpdateResponse.class);
        String newToken = profileRes.getToken();

        // 4. Verify browser/auth restoration data source (/users/me) returns the updated profile
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + newToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("profile-new@pulsecart.com"))
                .andExpect(jsonPath("$.firstName").value("NewFirstName"))
                .andExpect(jsonPath("$.lastName").value("NewLastName"))
                .andExpect(jsonPath("$.phone").value("9876543210"));

        // 5. Duplicate email update is rejected (try to update to customer@pulsecart.com)
        ProfileUpdateRequest duplicateEmailReq = new ProfileUpdateRequest("Name", "Name", "123", "customer@pulsecart.com");
        mockMvc.perform(put("/api/users/profile")
                .header("Authorization", "Bearer " + newToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateEmailReq)))
                .andExpect(status().isBadRequest());

        // 6. Unauthenticated update is rejected
        mockMvc.perform(put("/api/users/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());

        // 7. Roles and Password remain unchanged after update
        LoginRequest loginCheck = new LoginRequest("profile-new@pulsecart.com", "password");
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginCheck)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[0]").value("ROLE_CUSTOMER"));

        // 8. Change password failure (wrong current password)
        ChangePasswordRequest wrongReq = new ChangePasswordRequest("wrong-password", "new-password");
        mockMvc.perform(put("/api/users/change-password")
                .header("Authorization", "Bearer " + newToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongReq)))
                .andExpect(status().isBadRequest());

        // 9. Change password success (Change Password regression remains passing)
        ChangePasswordRequest correctReq = new ChangePasswordRequest("password", "new-password");
        mockMvc.perform(put("/api/users/change-password")
                .header("Authorization", "Bearer " + newToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(correctReq)))
                .andExpect(status().isOk());

        // Verify old password no longer works for authentication
        LoginRequest oldLogin = new LoginRequest("profile-new@pulsecart.com", "password");
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(oldLogin)))
                .andExpect(status().isUnauthorized());

        // Verify new password works for authentication
        LoginRequest newLogin = new LoginRequest("profile-new@pulsecart.com", "new-password");
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newLogin)))
                .andExpect(status().isOk());
    }

    @Test
    public void testCrossUserOrderAccessBlocked() throws Exception {
        // 1. Authenticate as User A (customer@pulsecart.com) and create an order
        String userAToken = getJwtToken("customer@pulsecart.com", "password");

        // Clear cart
        mockMvc.perform(delete("/api/cart")
                .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk());

        // Find active product
        Product laptop = productRepository.findAll().stream()
                .filter(Product::getActive)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed products not found!"));

        // Add item
        CartItemRequest addReq = new CartItemRequest(laptop.getId(), 1);
        mockMvc.perform(post("/api/cart/items")
                .header("Authorization", "Bearer " + userAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk());

        // Checkout
        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setShippingAddress("User A Address");
        checkoutReq.setPaymentMethod("CREDIT_CARD");
        checkoutReq.setMockPaymentStatus("SUCCESS");

        MvcResult checkoutRes = mockMvc.perform(post("/api/checkout")
                .header("Authorization", "Bearer " + userAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkoutReq)))
                .andExpect(status().isOk())
                .andReturn();

        String checkoutBody = checkoutRes.getResponse().getContentAsString();
        OrderDto orderDto = objectMapper.readValue(checkoutBody, OrderDto.class);
        Long orderId = orderDto.getId();

        // Verify User A can fetch their order details
        mockMvc.perform(get("/api/orders/" + orderId)
                .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId));

        // 2. Create and authenticate User B
        SignupRequest userBSignup = new SignupRequest();
        userBSignup.setEmail("userb@pulsecart.com");
        userBSignup.setPassword("password");
        userBSignup.setFirstName("User");
        userBSignup.setLastName("B");
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userBSignup)))
                .andExpect(status().isOk());

        String userBToken = getJwtToken("userb@pulsecart.com", "password");

        // 3. Try to access User A's order details using User B's token (should return 404 Resource Not Found)
        mockMvc.perform(get("/api/orders/" + orderId)
                .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testSeededProductImagesAndDtoPreservation() throws Exception {
        // Query products from controller API (which maps to ProductDto)
        mockMvc.perform(get("/api/products")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].imageUrl").exists())
                .andExpect(jsonPath("$.content[0].imageUrl").value(org.hamcrest.Matchers.startsWith("/assets/products/")));
    }

    @Test
    public void testAdminOrdersLazyInitializationRegression() throws Exception {
        // 1. Authenticate as User A (customer@pulsecart.com) and create an order
        String userToken = getJwtToken("customer@pulsecart.com", "password");

        // Clear cart
        mockMvc.perform(delete("/api/cart")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());

        // Find active product
        Product product = productRepository.findAll().stream()
                .filter(Product::getActive)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed products not found!"));

        // Add item
        CartItemRequest addReq = new CartItemRequest(product.getId(), 1);
        mockMvc.perform(post("/api/cart/items")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk());

        // Checkout
        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setShippingAddress("123 Test St, Seattle, WA");
        checkoutReq.setPaymentMethod("CREDIT_CARD");
        checkoutReq.setMockPaymentStatus("SUCCESS");

        MvcResult checkoutRes = mockMvc.perform(post("/api/checkout")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkoutReq)))
                .andExpect(status().isOk())
                .andReturn();

        String checkoutBody = checkoutRes.getResponse().getContentAsString();
        OrderDto createdOrder = objectMapper.readValue(checkoutBody, OrderDto.class);
        Long orderId = createdOrder.getId();

        // 2. Fetch all orders as unauthenticated user -> should return 401/403
        mockMvc.perform(get("/api/admin/orders"))
                .andExpect(status().isForbidden());

        // 3. Fetch all orders as customer -> should return 401/403
        mockMvc.perform(get("/api/admin/orders")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // 4. Fetch all orders as admin -> should return 200 OK
        String adminToken = getJwtToken("admin@pulsecart.com", "password");
        MvcResult adminOrdersRes = mockMvc.perform(get("/api/admin/orders")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andReturn();

        String adminOrdersBody = adminOrdersRes.getResponse().getContentAsString();
        List<OrderDto> adminOrdersList = objectMapper.readValue(
                adminOrdersBody, 
                objectMapper.getTypeFactory().constructCollectionType(List.class, OrderDto.class)
        );

        // Verify the newly created order is present in the admin list
        OrderDto retrievedOrder = adminOrdersList.stream()
                .filter(o -> o.getId().equals(orderId))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Created order not found in admin orders list!"));

        // Verify order items and product info is mapped safely
        assertFalse(retrievedOrder.getItems().isEmpty());
        assertEquals(product.getId(), retrievedOrder.getItems().get(0).getProductId());
        assertEquals(product.getName(), retrievedOrder.getItems().get(0).getProductName());

        // 5. Update order status as admin
        java.util.Map<String, String> statusUpdate = new java.util.HashMap<>();
        statusUpdate.put("status", "DELIVERED");

        mockMvc.perform(put("/api/admin/orders/" + orderId + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        // 6. Verify customer sees updated status in history details
        mockMvc.perform(get("/api/orders/" + orderId)
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));
    }
}
