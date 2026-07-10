# Academic Viva / Project Defense Preparation Q&A

This document compiles common architectural, algorithmic, and operational questions asked during collegiate project defenses, along with direct answers based on PulseCart's implementation.

---

### Q1: Explain the recommendation algorithm formula. How are the weights assigned?
**A**: PulseCart utilizes a hybrid recommendation algorithm scoring candidate items based on user preferences and catalog trends. The scoring equation is:
$$Score = 0.45 \times C_p + 0.20 \times B_p + 0.15 \times P_{op} + 0.10 \times R_{ating} + 0.10 \times R_{ecency}$$
* **Weights** are assigned to user behaviors to reflect purchase intent: Views and Searches have a weight of `1`, Cart additions have a weight of `3`, Rating stars have a weight of `1-5`, and Purchases have the highest weight of `5`.
* Category and brand affinities are normalized by the user's highest category/brand weight, ensuring score elements remain bounded between `0` and `1`.

### Q2: What is the "Cold-Start" problem, and how does your application address it?
**A**: The cold-start problem occurs when a new user registers and has no previous view or purchase history, preventing the recommendation engine from calculating affinity scores.
* **Our Solution**: If a user's interaction log count is zero, the system falls back to a **cold-start strategy** that generates recommendations based on global catalog popularity (highest review counts) and quality (average rating >= 4.5), ensuring a personalized feel from day one.

### Q3: How is database transactional integrity maintained during product checkouts?
**A**: When a user checks out, stock quantities must be decremented atomically to prevent race conditions or double-purchasing under concurrent loads.
* **Our Solution**: The `placeOrder()` method is annotated with Spring's `@Transactional` annotation. If any product stock is insufficient, the system throws an `InsufficientStockException`, causing the database transaction to roll back completely (restoring inventory and cancelling order creations).

### Q4: How does the Azure Blob Storage local fallback mechanism operate?
**A**: We use the official Azure Storage Blob Java SDK.
* During initialization (`@PostConstruct` in `StorageServiceImpl`), we verify the connection string. If it is empty, formatted incorrectly, or times out, the service logs a warning and marks `azureActive = false`.
* When a product image is uploaded, if Azure is inactive, the file is saved directly to a local project directory (`uploads/`). Spring Boot is configured to map and serve this directory at the `/uploads/**` URL pattern.

### Q5: Why did you choose Flyway migrations over Hibernate `ddl-auto=update`?
**A**: Flyway migrations serve as the authoritative schema management tool. Unlike Hibernate's automatic table generation which can result in divergent, untrackable schemas across local developer databases and production instances, Flyway enforces incremental SQL scripts (`V1`, `V2`, etc.) in sequential order. This guarantees schema parity across MySQL, Azure SQL Server, and local testing H2 databases.
