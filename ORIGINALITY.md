# Originality Report

PulseCart is built as a complete, original, and distinct e-commerce project designed from scratch.

## 1. Custom Recommendation Algorithm (Hybrid Score)
Instead of standard content-based filtering or random matching, PulseCart implements a deterministic, multi-factor hybrid ranking formula. User interactions are stored in `USER_INTERACTIONS` with custom base weights:
- `PRODUCT_VIEW`: 1
- `SEARCH`: 1
- `ADD_TO_CART`: 3
- `PURCHASE`: 5
- `RATING`: Rating value normalized (e.g. out of 5)

Using these, category and brand affinities are calculated per user. Candidate items are generated from preferred categories/brands and ranked using:
$$\text{finalScore} = 0.45 \times \text{CategoryPreference} + 0.20 \times \text{BrandPreference} + 0.15 \times \text{Popularity} + 0.10 \times \text{AverageRating} + 0.10 \times \text{Recency}$$
Inactive and out-of-stock items are automatically excluded. For cold-start scenarios, category-diverse trending items are selected.

## 2. Flyway-Led Relational Schema
The database schema is designed cleanly using native SQL and managed entirely via Flyway migration files located in `backend/src/main/resources/db/migration/`. Hibernate's `ddl-auto` is set to `validate` to prevent any automated schema modifications.

## 3. Storage and Execution Adaptability
The application abstractly decouples file storage and recommendation execution:
- **Storage**: Uses `StorageService` interface. The `local` profile uses file storage on the server, while the `azure` profile automatically uses Azure Blob Storage SDK.
- **Recommendations**: Can be processed locally via a cron-like schedule in Spring Boot, or asynchronously in Azure via a timer-triggered Java Azure Function accessing the database directly.

## 4. Professional Visual Language
The storefront features a customized Tailwind CSS color scheme, responsive sidebar-based admin navigation, clear state indicators (loading skeletons, empty states), and explanation labels for recommendation sections (e.g., *"Because you recently bought gaming products"*).
