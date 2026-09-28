# FURNITURA (`luxury-interio` & `furnitura-admin`)

A luxury modern furniture eCommerce and enterprise business management platform (`primo8/luxury-interio`).

FURNITURA combines an editorial customer storefront with an enterprise-grade Admin Command Center, deployed as two isolated Cloudflare Workers sharing a scalable cloud backend architecture designed for global high-ticket luxury commerce.

---

## 🏛️ Platform Architecture

```
                                  ┌──────────────────────────────────────────┐
                                  │      CUSTOMER STOREFRONT WORKER          │
                                  │   Cloudflare Worker: luxury-interio      │
                                  │     React 19 + TypeScript + Vite         │
                                  │       Interactive 3D Three.js            │
                                  └────────────────────┬─────────────────────┘
                                                       │
                                                       │ HTTPS / REST (VITE_API_URL)
                                                       ▼
┌──────────────────────────────────────────┐  ┌─────────────────────────────────┐
│         ADMIN DASHBOARD WORKER           │  │        RENDER CLOUD API         │
│   Cloudflare Worker: furnitura-admin     ├──┼─►  Node.js (Compiled JavaScript)│
│    Business Ops & Order Management       │  │  Express 5 + Strict Server RBAC │
└──────────────────────────────────────────┘  └───────┬─────────────────┬───────┘
                                                      │                 │
                                                      ▼                 ▼
                                           ┌────────────────────┐ ┌───────────────┐
                                           │   MONGODB ATLAS    │ │   FIREBASE    │
                                           │ Production DB of   │ │Authentication │
                                           │ Record & Audit Log │ │  (Admin SDK)  │
                                           └────────────────────┘ └───────────────┘
                                                      │
                                                      ▼
                                           ┌────────────────────┐
                                           │  MTN MOMO SANDBOX  │
                                           │  Secure Collection │
                                           │ & Status Lifecycle │
                                           └────────────────────┘
```

---

## ⚡ Cloudflare Workers Setup

| Worker Name | Role | Config File | Output Directory | Build Mode | Deploy Command |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`luxury-interio`** | Customer Storefront | `wrangler.jsonc` | `./dist` | `VITE_APP_MODE=client` | `npm run deploy:store` |
| **`furnitura-admin`** | Admin Dashboard | `wrangler.admin.jsonc` | `./dist-admin` | `VITE_APP_MODE=admin` | `npm run deploy:admin` |

---

## ✨ Key Capabilities & Systems

### 1. 🛋️ Customer Storefront (`luxury-interio`)
* **Interactive 3D Furniture Experience**: WebGL & Three.js orbital viewer with 360° rotation, wireframe inspection, realistic lighting presets, and real-time fabric/finish customization.
* **Curated Lookbook Showroom**: High-fidelity editorial carousel highlighting luxury interior collections.
* **Room-Based Catalog**: Refined filtering across Living Room, Bedroom, Dining Room, Executive Office, and Storage.
* **Dynamic Cart & Checkout**: Slide-out cart with authoritative server pricing, promotional code validation, dynamic delivery zone calculation, and multi-step checkout.

### 2. ⚡ Admin Command Center (`furnitura-admin`)
* **Executive Dashboard**: Real-time revenue metrics, order velocity, live payment statuses, and low-stock alerts.
* **Order Lifecycle Management**: Full state machine (`PENDING_PAYMENT` → `PAID` → `PROCESSING` → `READY_FOR_DELIVERY` → `OUT_FOR_DELIVERY` → `DELIVERED`).
* **Payment Operations**: Server-side MTN MoMo transaction tracking, status reconciliation, and customer verification.
* **Catalog & 3D Studio Manager**: Product management with 3D model configuration and gallery image curation.
* **Inventory & Stock Tracking**: Real-time stock counts with automatic deduction on payment confirmation and detailed audit logs.
* **Promotions & Discounts**: Percentage and fixed-amount coupon rules with date ranges, minimum order requirements, and usage limits.
* **Customer CRM & Delivery Zones**: Customer profiles with order history, lifetime value, and regional delivery zone fee management.
* **Granular RBAC & Security**: Role-based access control (`SUPER_ADMIN`, `ADMIN`, `ORDER_MANAGER`, `PRODUCT_MANAGER`, `FINANCE_MANAGER`, `CONTENT_MANAGER`, `SUPPORT_AGENT`).

### 3. 🌐 Cloud & Backend Infrastructure
* **Render Production API**: Independent compiled JavaScript runtime running directly on Node.js without runtime `tsx` dependency.
* **MongoDB Atlas Database**: Dedicated cloud database serving as the production source of truth for products, orders, payments, customers, discounts, delivery zones, staff, reviews, notifications, and immutable audit logs.
* **Firebase Authentication**: Server-side token verification using Firebase Admin SDK with MongoDB staff record resolution.
* **MTN MoMo Sandbox Integration**: Secure server-side Collection API implementation (`requesttopay`, authorization token caching, polling status reconciliation).
* **Dual Cloudflare Workers**: High-performance edge deployment for storefront and administrative web interfaces with customized security headers and SPA routing.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Custom CSS, Lucide React, Canvas Confetti |
| **3D Rendering** | Three.js WebGL Engine |
| **Edge Hosting** | Cloudflare Workers (`wrangler` SPA Assets) |
| **Backend API** | Node.js (ESM), Express 5, TypeScript (Compiled with esbuild) |
| **Database** | MongoDB Atlas, Mongoose 9 ODM |
| **Authentication** | Firebase Authentication (Client SDK & Firebase Admin SDK v14) |
| **Payments** | MTN MoMo OpenAPI Collection (Sandbox & Production architecture) |
| **Backend Hosting** | Render (Web Service) |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* Node.js v20+ or v24+
* npm v10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

### 4. Run Development Servers
Start Customer Storefront locally (port 5180):
```bash
npm run dev:client
```

Start Admin Dashboard locally (port 5181):
```bash
npm run dev:admin
```

Start backend API server (with tsx development watcher):
```bash
npm run server:dev
```

### 5. Production Build & Validation
Build both Cloudflare Workers & Backend Server:
```bash
npm run build:all
npm run lint
```

Start the compiled production backend server:
```bash
npm start
```

### 6. Cloudflare Worker Deployment
Deploy individual workers or all at once:
```bash
# Deploy Customer Storefront Worker
npm run deploy:store

# Deploy Admin Dashboard Worker
npm run deploy:admin

# Deploy Both Workers
npm run deploy:all
```

---

## 📖 Deployment Guide

For comprehensive deployment instructions covering Cloudflare Workers, Render Web Service, MongoDB Atlas, and Firebase Admin setup, refer to [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## 🔒 Security & Safe Diagnostics

* **API Health Check**: `GET /health`
* **Database Health**: `GET /health/database`
* **MTN Configuration Status**: `GET /api/payments/mtn/config-status` (Exposes safe status flags only; secrets and private keys are never transmitted).
