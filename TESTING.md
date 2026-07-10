# Testing Strategy and Test Suite Specifications

This document outlines the testing suite, mock context overrides, and automated validation coverage for the PulseCart e-commerce storefront.

---

## 1. Testing Architecture

PulseCart utilizes **Spring Boot Integration Testing** to validate REST controllers, JPA services, security authorization layers, and transaction lifecycles.

* **Database Isolation**: Tests run against an isolated **H2 In-Memory Database** (configured in MySQL mode).
* **Flyway Deactivation**: Flyway is disabled during testing. Hibernate `ddl-auto=create-drop` creates the schemas on-the-fly, and standard Java `DatabaseSeeder.java` seeds the initial catalog. This avoids database dialect migration failures during test compilation.
* **REST Execution**: Spring Security filters and endpoint controls are verified using `MockMvc` requests.

---

## 2. Test Suite Catalog: `StorefrontIntegrationTest.java`

Located at: [StorefrontIntegrationTest.java](file:///C:/Users/Asus/.gemini/antigravity/scratch/pulsecart/backend/src/test/java/com/pulsecart/StorefrontIntegrationTest.java)

| Test Method | Features Validated | Expected Output / Checks |
|---|---|---|
| `testAuthenticationFlow()` | User signup, signin, token generation, bad password rejection | `200 OK` + JSON message on signup; `200 OK` + JWT token on login; `401 Unauthorized` on wrong password |
| `testCartAndCheckoutFlow()` | Add items to cart, retrieve totals, checkout invoice placement, inventory deduction | `200 OK` + cart quantity matches; `200 OK` + stock reduced atomically; `400 Bad Request` on empty checkout |
| `testReviewsRestrictions()` | Star rating addition, verified purchaser restrictions, duplicate review blockers | `400 Bad Request` if unpurchased; `200 OK` if purchased; `400 Bad Request` on second review |
| `testSearchAndSpecifications()` | Multi-parameter search, price limits, keyword matches | `200 OK` + checks product listings; empty content list if price bound too low |
| `testAdminSecurityAndDashboard()` | Role-based endpoint authorization controls (RBAC) | `403 Forbidden` for customers; `200 OK` for administrators |
| `testRecommendationEngineAndColdStart()` | Analytical scoring equation, category/brand affinity, cold-start lists | `200 OK` + top-rated items for new users; affinity-tagged explanations for views |

---

## 3. Running Automated Tests

To execute the test suite:
```bash
cd backend
mvn test
```
All surefire reports are outputted to the `backend/target/surefire-reports` folder.
