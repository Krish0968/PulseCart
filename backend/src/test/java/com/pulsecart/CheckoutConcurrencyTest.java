package com.pulsecart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulsecart.dto.CartItemRequest;
import com.pulsecart.dto.CheckoutRequest;
import com.pulsecart.dto.SignupRequest;
import com.pulsecart.model.Product;
import com.pulsecart.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
public class CheckoutConcurrencyTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testConcurrentCheckoutsCannotOversell() throws Exception {
        // 1. Find an active product and set its stock to exactly 3
        Product product = productRepository.findAll().stream()
                .filter(Product::getActive)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active product found"));
        
        Long productId = product.getId();
        int initialStock = 3;
        product.setStockQuantity(initialStock);
        productRepository.saveAndFlush(product);

        // 2. Prepare 5 concurrent users
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        List<Future<Integer>> futures = new ArrayList<>();
        long timestamp = System.currentTimeMillis();

        for (int i = 0; i < threadCount; i++) {
            final String email = "concurrent-user-" + i + "-" + timestamp + "@pulsecart.com";
            final String password = "password";

            // Register
            SignupRequest signup = new SignupRequest();
            signup.setEmail(email);
            signup.setPassword(password);
            signup.setFirstName("Concurrent");
            signup.setLastName("User" + i);
            mockMvc.perform(post("/api/auth/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(signup)))
                    .andExpect(status().isOk());

            // Signin to get token
            MvcResult loginResult = mockMvc.perform(post("/api/auth/signin")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(signup)))
                    .andExpect(status().isOk())
                    .andReturn();
            String responseStr = loginResult.getResponse().getContentAsString();
            String token = objectMapper.readTree(responseStr).get("token").asText();

            // Setup cart with 1 item
            mockMvc.perform(delete("/api/cart")
                    .header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk());

            CartItemRequest addReq = new CartItemRequest(productId, 1);
            mockMvc.perform(post("/api/cart/items")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(addReq)))
                    .andExpect(status().isOk());

            // Submit callable tasks
            Callable<Integer> checkoutTask = () -> {
                latch.await(); // Hold execution until trigger
                
                CheckoutRequest checkoutReq = new CheckoutRequest();
                checkoutReq.setShippingAddress("Concurrent Address");
                checkoutReq.setPaymentMethod("CREDIT_CARD");
                checkoutReq.setMockPaymentStatus("SUCCESS");

                MvcResult res = mockMvc.perform(post("/api/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutReq)))
                        .andReturn();
                
                return res.getResponse().getStatus();
            };
            futures.add(executor.submit(checkoutTask));
        }

        // Release all threads simultaneously
        latch.countDown();

        // 3. Inspect results
        int successCount = 0;
        int failCount = 0;
        for (Future<Integer> future : futures) {
            int status = future.get();
            if (status == 200) {
                successCount++;
            } else if (status == 400) {
                failCount++;
            }
        }

        executor.shutdown();

        // Verify behavior
        assertEquals(initialStock, successCount, "Exactly 3 checkouts should succeed");
        assertEquals(threadCount - initialStock, failCount, "Exactly 2 checkouts should fail");

        // Verify remaining stock is exactly 0
        Product finalProduct = productRepository.findById(productId).get();
        assertEquals(0, finalProduct.getStockQuantity(), "Stock should be depleted to 0");
    }
}
