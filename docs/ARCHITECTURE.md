# System Architecture and Design Document

This document provides a comprehensive overview of the PulseCart e-commerce storefront system architecture, data flow, recommendation algorithm, and infrastructure scalability design.

---

## 1. System Topology Overview

PulseCart is designed as a secure, distributed, multi-tier web application built on modern microservice patterns. It separates user interface representation, business application logic, serverless analytical processing, and storage.

```
       +--------------------------------------------+
       |           Client (Vite + React)            |
       +--------------------------------------------+
                             | HTTPS
                             v
               +----------------------------+
               |    Azure Load Balancer     |
               +----------------------------+
                             |
         +-------------------+-------------------+
         | Port 80                               | Port 80
         v                                       v
+------------------+                    +------------------+
| App VM Instance  |                    | App VM Instance  |
| (Docker Host 1)  |                    | (Docker Host 2)  |
+------------------+                    +------------------+
  | (Nginx Forward)                       | (Nginx Forward)
  v                                       v
+------------------+                    +------------------+
|   Spring Boot    |                    |   Spring Boot    |
|   App Server 1   |                    |   App Server 2   |
+------------------+                    +------------------+
         |                                       |
         +-------------------+-------------------+
                             | JDBC
                             v
               +----------------------------+
               |     Azure SQL Database     |
               +----------------------------+
                             ^
                             | DB Reads/Writes
               +----------------------------+
               |  Azure Timer Functions     |
               | (Analytical Processor)     |
               +----------------------------+
                             | HTTP Trigger (Authentication + Regeneration)
                             +
```

---

## 2. Recommendation Scoring Engine Formula

The core recommendation engine leverages a **hybrid behavior-based scoring equation** to serve personalized items:

$$Score = 0.45 \times C_p + 0.20 \times B_p + 0.15 \times P_{op} + 0.10 \times R_{ating} + 0.10 \times R_{ecency}$$

Where:
* **$C_p$ (Category Preference)**: Sum of weights of user interactions matching the candidate product's category, normalized by the user's top category weight.
* **$B_p$ (Brand Preference)**: Sum of weights of user interactions matching the candidate product's brand, normalized by the user's top brand weight.
* **$P_{op}$ (Popularity)**: Product's review count normalized by the maximum review count in the catalog.
* **$R_{ating}$ (Rating)**: Average customer rating normalized out of 5 stars ($Rating / 5.0$).
* **$R_{ecency}$ (Recency)**: Product ID normalized by the maximum product ID in the database.

### Telemetry Weights:
* `PRODUCT_VIEW`: 1
* `SEARCH`: 1
* `ADD_TO_CART`: 3
* `RATING`: Rating Value (1-5)
* `PURCHASE`: 5

---

## 3. High Availability and Autoscaling Design (REQ-17)

To handle dynamic load and ensure 99.99% availability, the Azure production environment is designed with the following scaling policies:

### 3.1. Azure Load Balancer & Traffic Manager
* **Load Balancer**: Distributes incoming HTTP/HTTPS traffic across VM Scale Set instances.
* **Health Probes**: Configured to poll the Spring Boot Actuator endpoint (`/actuator/health`) every 10 seconds. If an instance fails 2 consecutive probes, it is taken out of rotation.

### 3.2. Azure Virtual Machine Scale Sets (VMSS)
* **Scale-Out Policy**: Triggered when average CPU utilization exceeds **70%** for 5 consecutive minutes. Adds 1 VM instance.
* **Scale-In Policy**: Triggered when CPU utilization drops below **30%** for 10 minutes. Removes 1 VM instance.
* **Minimum Instances**: 2 (spread across different Availability Zones).
* **Maximum Instances**: 10.
