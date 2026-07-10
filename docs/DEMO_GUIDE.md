# PulseCart Local Demonstration Walkthrough Guide

This guide details instructions on launching, testing, and presenting the PulseCart personalized e-commerce application.

---

## 1. Prerequisites
Ensure you have the following installed on your machine:
* **Java Development Kit (JDK)**: Version 21 or 24.
* **Node.js**: Version 20 or higher (with npm).
* **Docker Desktop**: For running the complete system in multi-container setups.

---

## 2. Launching Locally with Docker Compose

To compile all source modules and start the database, backend services, and Nginx frontend:

1. Navigate to the project root directory.
2. Run the compose build command:
   ```bash
   docker-compose up --build -d
   ```
3. Wait for the database health check to pass. The backend will automatically apply database seeds.
4. Access the applications in your browser:
   * **Storefront Frontend Client**: [http://localhost](http://localhost) (Port 80)
   * **Spring Boot REST Swagger Docs**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

## 3. Running Manually (Without Docker)

### 3.1. Startup Local MySQL
Ensure you have a MySQL server running on port `3306` with database name `pulsecart` and password `password`.

### 3.2. Launch Spring Boot Backend
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 3.3. Launch React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Suggested Demo Flow Steps

### Step 1: Browse Store Catalog (Anonymous)
* Open [http://localhost](http://localhost).
* Browse category blocks or open the Catalog list.
* Open the **PulsePro Laptop 15** details page. Note that the review submission form is hidden.

### Step 2: Sign In as Customer
* Navigate to the Login screen.
* Enter credentials:
  * **Email**: `customer@pulsecart.com`
  * **Password**: `password`
* Once logged in, notice the **Recommended For You** carousel on the home landing page displaying products with explanation labels.

### Step 3: Add to Cart and Check Out
* Browse a product, increment quantity to 2, and click **Add to Cart**.
* Open the Cart, review sub-totals, and click **Proceed to Checkout**.
* Fill in address info. Select **Payment SUCCESS** and click **Place Order**.
* Verify order receipt showing the unique order invoice number.

### Step 4: Write a Product Review
* Navigate back to the product details page of the item you just purchased.
* The review submission box is now unlocked. Select 5 stars, write feedback, and click **Post Review**.
* Notice the rating changes immediately on the page.

### Step 5: Admin Management Console
* Sign out and log in as the Store Administrator:
  * **Email**: `admin@pulsecart.com`
  * **Password**: `password`
* Navigate to [http://localhost/admin](http://localhost/admin) (or click the Admin console link in the header).
* Check the metrics cards, low stock tables, edit a product's description, and change order fulfillment status.

### Step 6: Behavior-Based Personalization on Demand
* Sign in as a fresh customer or register a new customer account.
* On the Home page, notice that the **Recommended For You** section shows default cold-start products (e.g. general trending or popular items).
* Navigate to the Catalog and click on 4–5 different **Gaming** products (e.g. graphics cards, gaming consoles) to view their details. This logs `PRODUCT_VIEW` interactions to the backend in real-time.
* Add one of the gaming products to your **Cart** (logs `ADD_TO_CART` interaction with a higher weight of 3).
* Return to the **Home** page.
* Click the **Recompute Recommendations** button on the top-right of the "Recommended For You" section.
* The recommendations list will instantly refresh. The gaming products you interacted with will now be ranked first, showing dynamic behavior-based personalization and affinity updates without waiting for any background scheduler interval.
