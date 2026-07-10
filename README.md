# PulseCart E-commerce Storefront with Personalized Recommendations

PulseCart is a secure, responsive, scalable, cloud-deployable e-commerce platform. It provides customers with category browsing, hybrid behavior-based recommendations, transactional checkouts, search, and reviews, while offering store administrators dashboard telemetry metrics, product CRUD operations, and fulfillment updates.

---

## 1. Project Directory Layout

* [/backend](file:///C:/Users/Asus/.gemini/antigravity/scratch/pulsecart/backend): Spring Boot application source code.
* [/frontend](file:///C:/Users/Asus/.gemini/antigravity/scratch/pulsecart/frontend): React frontend client built with Vite and Tailwind CSS.
* [/azure-functions](file:///C:/Users/Asus/.gemini/antigravity/scratch/pulsecart/azure-functions): Serverless Timer-Triggered Azure Function recommendation regenerator.
* [/docs](file:///C:/Users/Asus/.gemini/antigravity/scratch/pulsecart/docs): Technical architecture and cloud cost documents.

---

## 2. Technology Stack

* **Backend**: Java 21/24, Spring Boot 3.3.1, JPA/Hibernate, Spring Security + JWT, Flyway.
* **Frontend**: Node.js, React 18, Vite 5, Tailwind CSS.
* **Databases**: MySQL (Local / Dev) & Azure SQL Database (Production).
* **Cloud Services**: Azure VMs (Compute Scale Set), Azure Blob Storage, Azure Functions, Azure Key Vault, Azure Monitor.

---

## 3. Quick Start (Local Run)

### 3.1. Using Docker Compose (Recommended)
From the project root:
```bash
docker-compose up --build -d
```
Access the application at [http://localhost](http://localhost).

### 3.2. Manual Startup
1. **Database**: Spin up MySQL on port 3306 with database name `pulsecart`.
2. **Backend**:
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Access the UI at [http://localhost:5173](http://localhost:5173).

---

## 4. API Documentation
Swagger OpenAPI documentation is auto-generated on startup. View it at:
[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
