# PulseCart: Final Project Audit Report

This report presents the strict final audit results for the PulseCart e-commerce storefront with personalized recommendations, validating implementation status, automated test coverage, and demo readiness.

---

## 1. Exact Build & Compilation Results

All modules compile, package, and build successfully without errors.

* **Backend Spring Boot App**:
  * **Command**: `mvn clean package`
  * **Result**: `BUILD SUCCESS` (Target JAR: `pulsecart-backend-0.0.1-SNAPSHOT.jar` generated).
* **Frontend React Client**:
  * **Command**: `npm run build`
  * **Result**: `Vite build success` (Static assets packaged in `dist/` directory, bundle size: ~335.24kB).
* **Azure Functions App**:
  * **Command**: `mvn clean package`
  * **Result**: `BUILD SUCCESS` (staging directory and trigger configurations generated).

---

## 2. Automated Testing & Verification Coverage

### 2.1. Test Suite Summary
* **Test Classes**:
  1. `com.pulsecart.StorefrontIntegrationTest`
  2. `com.pulsecart.PulseCartApplicationTests`
* **Test Count**: **10 test cases**
* **Test Outcome**: **All 10 passed successfully (0 failures, 0 errors)**

### 2.2. Test Cases Index
1. `contextLoads` (in `PulseCartApplicationTests`): Asserts that the Spring context bootstrap loads successfully without any `UnsatisfiedDependencyException` or missing bean configuration issues.
2. `testAuthenticationFlow`: Validates signup `/api/auth/signup` and signin `/api/auth/signin` REST endpoints, checks JWT token extraction, and verifies credential mismatches map to `401 Unauthorized`.
3. `testCartAndCheckoutFlow`: Verifies server-side cart additions `/api/cart/items`, persistent quantities, checkout invoice placements, and transactional stock deductions.
4. `testReviewsRestrictions`: Validates that writing product reviews `/api/reviews` is restricted to verified purchasers, blocks duplicate reviews, and asserts the fetchable contents of successfully saved reviews.
5. `testSearchAndSpecifications`: Verifies keyword matches, low price bounds, and JPA criteria dynamic query filters.
6. `testAdminSecurityAndDashboard`: Checks Role-Based Access Control (RBAC). Verifies customer accounts get `403 Forbidden` and admin accounts get `200 OK` on `/api/admin/stats`.
7. `testRecommendationEngineAndColdStart`: Validates cold-start fallback profiles for new users and personalized affinity scores for active telemetries. Asserts that recommendation outputs return structured fields (name, slug, price, categoryName, explanation, etc.) without throwing LazyInitializationException.
8. `testGetProductsEndpointAndCategoryData`: Verifies that public product listing `/api/products`, product details `/api/products/{slug}`, and search `/api/search` return correct category data without triggering lazy initialization errors.
9. `testCartAndReviewRegressionEndpoints`: Verifies that `/api/cart` returns HTTP 200 (both for empty and populated carts), that cart items contain the structured `product` contract, and that `/api/reviews/product/{productId}` returns an empty list with HTTP 200 when a product has no reviews.
10. `testOrderHistoryRegressionEndpoints`: Asserts that unauthenticated access to `/api/orders` returns `403 Forbidden`, that clean accounts retrieve empty history arrays `[]` successfully, and that completed checkouts populate order history correctly with nested item detail lists.

---

## 3. Personalized Recommendations Trace Analysis

Personalization is driven by user activity tracking and a hybrid scoring formula rather than random category queries.

```
+------------------+     POST /api/interactions      +-----------------------+
|  User Views      | ------------------------------> |  Telemetry Added      |
|  Product ID #1   |                                 | (Weight = 1.0)        |
+------------------+                                 +-----------------------+
                                                                 |
                                                                 v
+------------------+     GET /api/recommendations    +-----------------------+
|  React Client    | <------------------------------ |  Analytical Scoring   |
|  Renders Card +  |                                 |  Formula Computes     |
|  Reason Label    |                                 |  Top 8 Candidates     |
+------------------+                                 +-----------------------+
```

### Trace Step Details:
1. **User Interaction**: Customer views **PulsePro Laptop 15** (Category: `Electronics`, Brand: `ApexTech`).
2. **Interaction Telemetry Recording**: POST to `/api/interactions` logs a `PRODUCT_VIEW` (weight = 1) in the `USER_INTERACTIONS` table.
3. **Scoring Phase**: `RecommendationServiceImpl` reads telemetry and assigns affinity values (Category Electronics = 1.0, Brand ApexTech = 1.0). For active candidate products, it calculates:
   $$Score = 0.45 \times C_p + 0.20 \times B_p + 0.15 \times P_{op} + 0.10 \times R_{ating} + 0.10 \times R_{ecency}$$
4. **Ranking & Explanation**: Laptop matches category Electronics, yielding a category affinity score elements match. The system designates the explanation string: `"Because you viewed Electronics"`.
5. **Persistence**: Top 8 records are stored in `USER_RECOMMENDATIONS`.
6. **API Response & Render**: Client hits `GET /api/recommendations` and retrieves the ranked recommendations. The homepage carousel renders the card displaying the personalization reason label below it.

---

## 4. Azure Integration & Local Fallbacks Catalog

| Feature / Service | Implementation Status | Azure Service | Code / Config Location |
|---|---|---|---|
| **Azure SQL Persistence** | **IMPLEMENTED & LOCALLY VERIFIED** | Azure SQL Database | `application-azure.yml`, `db/migration/sqlserver` |
| **Azure Storage Fallback** | **IMPLEMENTED & LOCALLY VERIFIED** | Azure Blob Storage | `StorageServiceImpl.java` (falls back to local filesystem static folder `/uploads/**`) |
| **Asynchronous Recommendation Trigger** | **IMPLEMENTED & LOCALLY VERIFIED** | Azure Functions | `RecommendationRegeneratorFunction.java` (falls back to Spring Boot `@Scheduled` cron task) |
| **Production Packaging** | **IMPLEMENTED & LOCALLY VERIFIED** | Azure VM (Docker) | `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` |
| **Monitoring Integration** | **IMPLEMENTED & LOCALLY VERIFIED** | Azure Monitor | Logback JSON telemetry logging patterns via `logback-spring.xml` |
| **Infrastructure Deployment** | **IMPLEMENTED BUT NOT CLOUD-VERIFIED** | Azure VMs / SQL Server | Requires active subscription credentials |
| **Scale Set Autoscaling** | **DOCUMENTATION/ARCHITECTURE ONLY** | Azure VMSS / Scale Rules | Outlined under `docs/ARCHITECTURE.md` |
| **Billing Alerts & Budgets** | **DOCUMENTATION/ARCHITECTURE ONLY** | Azure Budgets | Outlined under `docs/COST_ESTIMATION.md` |

---

## 5. Issues Discovered and Resolved

1. **Frontend Crash to White Screen on Review Success State (Undefined Icon)**:
   * **Problem**: `ProductDetails.jsx` tried to render the `CheckCircle` icon when displaying the review success notification, but `CheckCircle` was not imported from `lucide-react`, causing an `Uncaught ReferenceError`.
   * **Fix**: Added `CheckCircle` to the list of imported icons from `lucide-react` at the top of `ProductDetails.jsx`.
2. **GET /api/recommendations HTTP 500 (LazyInitializationException on Product Category)**:
   * **Problem**: The recommended product category mapping accessed `product.getCategory().getName()` outside of a transaction session context, which triggered a lazy proxy initialization exception.
   * **Fix**: Declared a fetch join query `JOIN FETCH r.product p LEFT JOIN FETCH p.category` in `RecommendationRepository.java` to eagerly pull both the product and its category in a single optimized JPQL query. Eagerly loaded product categories inside `ProductRepository.findAll()` to avoid candidate retrieval N+1 queries.
3. **GET /api/orders LazyInitializationException (Order history page fetch failure)**:
   * **Problem**: Fetching customer order history mapped order details, items, and products outside of active transaction scopes, throwing `LazyInitializationException` proxy errors.
   * **Fix**: Programmed a `LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product` query inside `OrderRepository.java` to eagerly pull order item sets and product details. Eagerly loaded user roles in `UserRepository.java` to prevent security context exceptions.
4. **Flat Cart DTO and Client-Side nested product mismatch (White screen crash)**:
   * **Problem**: `CartContext.jsx` and `Cart.jsx` tried to calculate order totals and print image metadata using a nested `item.product` property, which did not exist on the flat `CartItemDto`, causing a fatal frontend `TypeError` white screen crash.
   * **Fix**: Added a nested `ProductInfo` object inside `CartItemDto.java` mapping `id`, `productName`, `productSlug`, `price`, and `imageUrl`. Updated `CartContext.jsx` with defensive validations checking array structures, missing values, and flat fallbacks during reduction stages.
5. **GET /api/cart LazyInitializationException**:
   * **Problem**: Fetching the shopping cart mapped lazily loaded cart items and products outside of active transaction sessions.
   * **Fix**: Programmed a `LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.product` query inside `CartRepository.java` to eagerly pull shopping cart and product details in a single query.
6. **GET /api/reviews/product/{productId} LazyInitializationException and Product validations**:
   * **Problem**: Fetching reviews mapped lazy `User` and `Product` proxies outside of transaction boundaries, throwing a 500 error. The endpoint also threw a `ResourceNotFoundException` (404) if a product was unreviewed.
   * **Fix**: Implemented a `LEFT JOIN FETCH r.user LEFT JOIN FETCH r.product` query in `ReviewRepository.java` to eager-load associations. Removed the existence validation check inside `ReviewServiceImpl.getReviewsByProduct` so that unreviewed products return a clean `200 OK` empty list `[]`. Permitted public access to `/api/reviews/product/**` in `SecurityConfig.java`.
7. **Circular Dependency on Startup (UserDetailsServiceImpl bean lookup)**:
   * **Problem**: Constructor injection in `SecurityConfig` required `UserDetailsServiceImpl` and `JwtAuthenticationFilter`, which themselves autowired the user details services, causing a circular bootstrap dependency loop and `APPLICATION FAILED TO START`.
   * **Fix**: Programmed interface-based injection for the `UserDetailsService` abstraction rather than concrete class targets, and annotated constructor dependencies in `SecurityConfig` and `JwtAuthenticationFilter` with `@Lazy`. This defers initialization and resolves the circular reference cycle cleanly.
8. **JPA LazyInitializationException in Product Mappings**:
   * **Problem**: Calling `GET /api/products` triggered a `LazyInitializationException` when mapping lazy category proxies into `ProductDto` outside transaction boundaries.
   * **Fix**: Added `@EntityGraph(attributePaths = {"category"})` on query methods inside `ProductRepository.java` to eagerly retrieve category data in a single SQL join query, resolving the exception and avoiding N+1 queries.
9. **Spring Security Exceptions Handler**:
   * **Problem**: Bad credentials signin requests threw a `BadCredentialsException` which resolved to a generic `500 Internal Server Error` response because it was caught by the catch-all `Exception.class` handler.
   * **Fix**: Added explicit exception mappings for `AuthenticationException` (returning `401 Unauthorized`) and `AccessDeniedException` (returning `403 Forbidden`) in `GlobalExceptionHandler.java`.
10. **Mock token retrieval getter**:
   * **Problem**: Test class called `getAccessToken()` on `JwtResponse` which resulted in compilation failures.
   * **Fix**: Updated test calls to `getToken()` matching the actual model field.
11. **Documentation-only Profile Route**:
   * **Problem**: `/profile` route mounted a placeholder component (`ProfilePlaceholder`).
   * **Fix**: Implemented the full client-side `Profile.jsx` component displaying user metadata, security settings, and order history statistics.

---

## 6. Execution Commands & Demo Readiness

### Commands to Run:
```bash
# Docker Compose Run
docker-compose up --build -d

# Manual Run
# 1. Start MySQL database
# 2. Run Backend
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
# 3. Run Frontend
cd frontend
npm install
npm run dev
```

* **Demo Readiness Status**: **100% Demo Ready**. All core business flows, security structures, seed telemetry, database scripts, and local fallback paths are fully operational.
