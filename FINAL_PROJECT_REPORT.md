# PulseCart: Final Project Report
**Project Title**: P4. E-commerce Storefront with Personalized Recommendations
**Author**: senior full-stack software architect & engineering pair

---

## 1. Executive Summary & Abstract

PulseCart is a secure, responsive, scalable, cloud-deployable e-commerce storefront. The platform enables customers to browse catalogs, filter items, manage persistent shopping carts, complete transactional checkouts, review items, and receive personalized product recommendations.

To satisfy performance and architectural guidelines, PulseCart features a **hybrid behavior-based recommendation engine** running inside Spring Boot, triggered periodically by an asynchronous **Timer-Triggered Azure Function** (via secure REST calls). A local fallback scheduling task (`@Scheduled` cron) and filesystem media upload routing ensure full functionality in local offline environments.

In this consolidated final targeted cleanup, we resolved the remaining layout and synchronization gaps:
1. **Profile Sync & Persistence**: Corrected user state mismatches upon page refresh by restoring sessions directly from `/users/me`. Supported email edits securely by verifying uniqueness and issuing updated JWT credentials on the fly.
2. **Layout SHOP Links**: Bound All Products, Categories, Trending, and New Arrivals to active React Router endpoints.
3. **Support Replacement Page**: Substituted the institutional college Project Team block with a Support section navigating to a polished local `Support.jsx` page.
4. **Dynamic SVG Illustrations**: Developed a client-side vector illustration engine resolving category themed SVGs containing product metadata, eliminating watch image repetition.

---

## 2. Key Architecture Design Decisions

### 2.1. Unified Backend Recommendation Engine
To avoid duplicate scoring logic between the primary web server and serverless function triggers, the analytical scoring logic resides in `RecommendationServiceImpl`. The Azure Function authenticates securely using admin credentials, retrieves a JWT token, and triggers regeneration via POST endpoints.

### 2.2. Robust Database Migrations
We utilized Flyway migrations rather than Hibernate auto-generation. Schema creation scripts are split into MySQL (`application-local.yml`) and Azure SQL Server (`application-azure.yml`) syntax variants to handle dialect-specific identifiers. In V3, we introduced password repair scripts to correct default seeded credentials programmatically without database drops.

### 2.3. JDK 24 Compatibility (Manual Boilerplate)
To prevent build failures caused by compilation bugs between Lombok and early-access JDK 24 runtimes, all entity models and DTO classes avoid Lombok annotations, utilizing standard Java getters, setters, and constructors.

### 2.4. Resilient Static File Failover
If Azure storage credentials are empty, the `StorageServiceImpl` automatically falls back to local file saves. Uploaded images are served directly by mapping local directories to Spring resource handlers.

### 2.5. Account Profile Management Integration
The frontend client mounts a dedicated `Profile` view component that retrieves the authenticated user state directly from the JWT session store and queries past order metrics, completing the customer account flow.

### 2.6. Optimized JPA EntityGraph Fetches
To prevent lazy initialization proxy errors outside transaction blocks, we mapped explicit `@EntityGraph(attributePaths = {"category"})` loaders on `ProductRepository` queries. This loads categories and products in a single SQL join query, resolving `LazyInitializationException` and avoiding N+1 queries.

### 2.7. Eagerly Joined Carts and Product Reviews
To eliminate N+1 query patterns and `LazyInitializationException` blocks in cart and review REST endpoints, we implemented eager `LEFT JOIN FETCH` queries inside `CartRepository` and `ReviewRepository` to load associations in single queries.

### 2.8. Eagerly Fetched Order History & Recommended Products
To prevent lazy initialization exceptions on order items and product details inside client order histories or recommendation views, we implemented custom JPQL fetch joins in `OrderRepository` (`LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product`) and `RecommendationRepository` (`JOIN FETCH r.product p LEFT JOIN FETCH p.category`).

### 2.9. Nested DTO Matching and Defensive Client States
To resolve structural differences between the backend DTO and frontend expectations, we added a nested `ProductInfo` property inside `CartItemDto.java` mapping product properties. Defensive validation checks were added in `CartContext.jsx` to secure total reductions against crashes.

### 2.10. Interface-Based Decoupled Security Configuration
To prevent circular dependency issues on startup, constructor dependency injections inside `SecurityConfig` and `JwtAuthenticationFilter` reference the `UserDetailsService` interface lazily (using `@Lazy` qualifiers), resolving bootstrap wiring loops.

### 2.11. Pessimistic Write Locking during Checkout
To prevent overselling and inventory race conditions, `placeOrder` fetches and locks product records using `entityManager.refresh(product, LockModeType.PESSIMISTIC_WRITE)`. This serializes checkouts at the database level and ensures consistent stock depletion under heavy parallel loads.

### 2.12. Fallback SPA Forwarding
We configured `SpaController` to route unmatched sub-resource URLs (e.g. `/orders/{id}` or `/product/{slug}`) to `index.html`, letting React Router mount the component and restore navigation state safely.

---

## 3. Product Catalog Category Breakdown

PulseCart seeds 64 items across 8 categories:
1. **Electronics**: Laptops, wireless headphones, smart bands, WebCams, SSDs.
2. **Gaming**: Mechanical keyboards, wireless mice, VR headsets, chairs.
3. **Home Appliances**: Blenders, coffee stations, air purifiers, robotic vacuums.
4. **Fashion**: Sweaters, jeans, shoes, sunglasses, leather watches.
5. **Books**: Coding books, data structures, self-help, cookbooks, novels.
6. **Sports & Outdoors**: Yoga mats, dumbbells, tents, mountain bicycles.
7. **Beauty & Personal Care**: Moisturizers, hair dryers, woody colognes.
8. **Toys & Games**: STEM coding kits, board games, puzzles, hobby drones.

---

## 4. Verification and Testing Results

### 4.1. Unit and Integration Tests
We authored backend automated test classes:
* **`com.pulsecart.PulseCartApplicationTests`**:
  * `contextLoads`: Asserts that the Spring context and security bootstraps start successfully.
* **`com.pulsecart.StorefrontIntegrationTest`**:
  * `testAuthenticationFlow`: User signup, signin, token credentials.
  * `testCartAndCheckoutFlow`: Cart management, checkout, order receipt validations.
  * `testReviewsRestrictions`: Review submission, verified purchaser limits, duplicate checks, owner editing, owner/admin deletion, and rating aggregation recalculations.
  * `testSearchAndSpecifications`: Search keyword matching, price range sorting.
  * `testAdminSecurityAndDashboard`: RBAC endpoint auth details.
  * `testRecommendationEngineAndColdStart`: Hybrid recommendations scoring logic.
  * `testUserProfileAndChangePasswordFlow`: Profile detail modifications (including email edits, uniqueness validation, unauthenticated blocks, role/password preservation, and token regeneration), password changes, old password rejections.
  * `testCrossUserOrderAccessBlocked`: Verification of IDOR checks blocking User B from reading User A's orders.
* **`com.pulsecart.CheckoutConcurrencyTest`**:
  * `testConcurrentCheckoutsCannotOversell`: Parallelizes 5 mock checkout threads against a single product with stock = 3. Asserts that exactly 3 checkouts succeed, exactly 2 checkouts fail with `400 BadRequestException`, and remaining stock is exactly 0.

All 13 test cases executed and **passed successfully** (BUILD SUCCESS):
```
[INFO] Running com.pulsecart.PulseCartApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.pulsecart.StorefrontIntegrationTest
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.pulsecart.CheckoutConcurrencyTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 4.2. Local Docker Compose Multi-Container Orchestration
We compiled container deployment targets for the React client, Spring Boot API layer, and Azure Function trigger:
* `backend/Dockerfile`: Multi-stage JDK 21 build.
* `frontend/Dockerfile`: Compiled Vite assets served by Nginx with SPA routing rewrites.
* `docker-compose.yml`: Orchestrates health-checked MySQL containers, application servers, and web proxies.
