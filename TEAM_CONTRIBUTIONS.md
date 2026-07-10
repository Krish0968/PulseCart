# Team Contributions

This document describes the primary ownership and collaborative integration work of the 3-member college team for PulseCart.

| Team Member | Primary Roles & Responsibilities | Key Modules Owned |
|---|---|---|
| **Member 1 (Backend Specialist)** | Backend APIs, Security/Auth filter, Recommendation scoring engine, integration testing | `backend/src/main/java/com/pulsecart/security`, `com.pulsecart.service.RecommendationServiceImpl`, controller layer, unit/integration tests |
| **Member 2 (Frontend Specialist)** | React application, UI component design, routing, state contexts, API client integrations | `frontend/src/context`, pages (Home, Cart, Checkout, Dashboard), components (Navbar, Carousel) |
| **Member 3 (Cloud & DevOps)** | Database schema (Flyway migrations), Azure Blob Storage adapter, Azure Functions processor, Docker packaging, Azure deployment documentation | `database/migrations`, `azure-functions/`, Dockerfiles, `AZURE_DEPLOYMENT.md`, `COST_ESTIMATION.md` |

## Collaboration Rules
- **Cross-Reviews**: All members must review code changes in all modules to ensure everyone can explain any part of the system in a project viva.
- **Unified Algorithm**: The recommendation algorithm logic must remain consistent between local fallback execution and Azure Function execution.
- **Portability**: Keep the code running locally on standard tools (MySQL, Local File System) even when Azure services are unavailable.
