# Azure Cloud Cost Estimation and Budget Controls

This document details the cost sheet for deploying PulseCart in production on Microsoft Azure, along with billing alert limits and cost control procedures.

---

## 1. Monthly Cost Estimation Sheet

The architecture leverages low-cost basic tiers suitable for academic demonstration while allowing easy upgrades for enterprise scaling.

| Service | Tier / SKU | Pricing Model | Unit Cost | Estimated Qty | Monthly Cost |
|---|---|---|---|---|---|
| **Azure VM (App Servers)** | B2s (2 vCPU, 4GB RAM) | Pay-as-you-go | $0.036 / hour | 2 Instances (24/7) | ~$52.00 |
| **Azure SQL Database** | S0 Standard (10 DTU, 250GB) | Provisioned | $15.00 / month | 1 Database | $15.00 |
| **Azure Blob Storage** | Hot LRS (Block Blob) | Pay-per-GB | $0.02 / GB | 50 GB Storage | $1.00 |
| **Azure Functions** | Consumption Plan | Pay-per-execution | $0.20 / Million | 1M executions | $0.00 (Free Tier) |
| **Azure Bandwidth** | Outbound Data Transfer | Pay-per-GB | $0.08 / GB | 100 GB Transfer | $8.00 |
| **Total Estimated Cost** | | | | | **~$76.00 / Month** |

---

## 2. Cost Control Procedures (REQ-18)

To ensure student/developer budget safety and avoid runaway cloud expenses:

### 2.1. Azure Billing Budgets & Alerts
* **Budget Cap**: Set at **$90.00 / Month**.
* **Alert Trigger 1**: Sends email notification to the administrator when actual costs reach **50% ($45.00)**.
* **Alert Trigger 2**: Sends email notification and triggers an Azure Logic App to suspend non-production instances when costs reach **80% ($72.00)**.
* **Alert Trigger 3**: Hard ceiling at **100% ($90.00)**, automatically disabling the subscription billing group.

### 2.2. Automated Idle Shutdowns
* **Dev/Test Environment VMs**: Configured with Azure Auto-Shutdown policies to automatically turn off at **10:00 PM** local time daily, saving over **33%** of compute costs during idle night hours.
* **Database Scaling**: Scale down Azure SQL Database to Basic Tier ($4.99/month) during off-peak holidays.
