# FURNITURA — Production Deployment & Cloud Architecture Guide

This guide details the step-by-step setup and live deployment of the **FURNITURA Luxury Commerce** application across Cloudflare Pages, Render, MongoDB Atlas, Firebase Authentication, and MTN MoMo Sandbox.

---

## 🏛️ Target Cloud Archite```
                    ┌──────────────────────────────────────┐
                    │        CUSTOMER STOREFRONT           │
                    │   Cloudflare Worker: luxury-interio  │
                    │         (VITE_APP_MODE=client)       │
                    └──────────────────┬───────────────────┘
                                       │ HTTPS (VITE_API_URL)
                                       ▼
                    ┌──────────────────────────────────────┐
                    │              RENDER API              │
                    │       Express + TS + Mongoose        │
                    │       MTN MoMo + RBAC Server         │
                    └───────────┬──────────────┬───────────┘
                                │              │
                                ▼              ▼
                    ┌────────────────────┐   ┌────────────────────┐
                    │   MONGODB ATLAS    │   │      FIREBASE      │
                    │   Production DB    │   │   Authentication   │
                    └────────────────────┘   └────────────────────┘
                                       ▲
                                       │ HTTPS (VITE_API_URL)
                    ┌──────────────────┴───────────────────┐
                    │           ADMIN DASHBOARD            │
                    │  Cloudflare Worker: furnitura-admin  │
                    │         (VITE_APP_MODE=admin)        │
                    └──────────────────────────────────────┘
```

---

## 1. 🗄️ MongoDB Atlas Setup

1. **Create Cluster**:
   * Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   * Create a new M0 (Free) or M10+ Production cluster in your preferred region (e.g. Frankfurt / Ireland).
2. **Database User**:
   * Navigate to **Security → Database Access**.
   * Add a new database user (e.g., `furnitura_app`) with **Read and write to any database** privileges and generate a secure password.
3. **Network Access**:
   * Navigate to **Security → Network Access**.
   * Add IP `0.0.0.0/0` (Allow access from anywhere, required for Render dynamic IP ranges) or configure Render outbound IPs.
4. **Obtain Connection String**:
   * Click **Connect → Drivers (Node.js)**.
   * Copy the connection string:
     ```
     mongodb+srv://furnitura_app:<password>@cluster0.abcde.mongodb.net/furnitura_prod?retryWrites=true&w=majority
     ```
5. **Initial Seed & Migration**:
   ```bash
   MONGODB_URI="mongodb+srv://..." npm run db:seed
   ```

---

## 2. 🔐 Firebase Authentication Setup

1. **Create Project**:
   * Visit [Firebase Console](https://console.firebase.google.com/) and create a project named `furnitura-luxury`.
2. **Enable Authentication**:
   * Under **Build → Authentication**, enable **Email/Password** and/or **Google Sign-In**.
3. **Admin Service Account (for Render Backend)**:
   * Go to **Project Settings → Service Accounts**.
   * Click **Generate new private key** (downloads JSON).
   * Extract for backend:
     * `project_id` → `FIREBASE_PROJECT_ID`
     * `client_email` → `FIREBASE_CLIENT_EMAIL`
     * `private_key` → `FIREBASE_PRIVATE_KEY`
4. **Web App Credentials (for Cloudflare Workers)**:
   * Under **Project Settings → General → Your apps**, add a Web App.
   * Copy the browser-safe client config (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.).
   * *Never put Firebase private key, MongoDB URI, or MTN credentials in frontend variables.*

---

## 3. 🚀 Render Backend Deployment

1. **Create Web Service**:
   * Connect your GitHub repository (`primo8/luxury-interio`) on [Render Dashboard](https://dashboard.render.com/).
   * Click **New → Web Service**.
2. **Configure Settings**:
   * **Name**: `furnitura-api`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `node dist-server/server.js` (or `npm start`)
   * **Health Check Path**: `/health`
3. **Environment Variables**:
   Add the following in the Render Environment tab:
   * `NODE_ENV`: `production`
   * `PORT`: `10000`
   * `MONGODB_URI`: `<Your MongoDB Atlas SRV URI>`
   * `FIREBASE_PROJECT_ID`: `<Your Firebase Project ID>`
   * `FIREBASE_CLIENT_EMAIL`: `<Your Firebase Client Email>`
   * `FIREBASE_PRIVATE_KEY`: `<Your Firebase Private Key>`
   * `MTN_ENV`: `sandbox`
   * `MTN_BASE_URL`: `https://sandbox.momodeveloper.mtn.com`
   * `MTN_COLLECTION_SUBSCRIPTION_KEY`: `<MTN Subscription Key - configured later>`
   * `MTN_API_USER`: `<MTN API User UUID - configured later>`
   * `MTN_API_KEY`: `<MTN API Key - configured later>`
   * `MTN_TARGET_ENVIRONMENT`: `sandbox`
   * `MTN_CURRENCY`: `EUR`
   * `CORS_ORIGINS`: `https://luxury-interio.<subdomain>.workers.dev,https://furnitura-admin.<subdomain>.workers.dev`

---

## 4. ⚡ Dual Cloudflare Workers Deployment

Both workers share the same Render API backend via `VITE_API_URL` while running as isolated Cloudflare Workers.

### A. Customer Storefront Worker (`luxury-interio`)
* **Worker Name**: `luxury-interio`
* **Configuration**: `wrangler.jsonc`
* **Assets Directory**: `./dist`
* **Build Command**: `npm run build:client` (or `npm run build:frontend`)
* **Deploy Command**: `npm run deploy:store` (or `npm run deploy:client`)
* **Environment Variables (`.env.client`)**:
  ```env
  VITE_APP_MODE=client
  VITE_API_URL=https://furnitura-api.onrender.com
  VITE_FIREBASE_API_KEY=AIzaSy...
  VITE_FIREBASE_AUTH_DOMAIN=furnitura-luxury.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=furnitura-luxury
  ```
* **Behavior**:
  * Delivers the luxury customer shopping experience (3D studio, room collections, cart, checkout).
  * Completely hides admin management interfaces and controls.

### B. Admin Dashboard Worker (`furnitura-admin`)
* **Worker Name**: `furnitura-admin`
* **Configuration**: `wrangler.admin.jsonc`
* **Assets Directory**: `./dist-admin`
* **Build Command**: `npm run build:admin`
* **Deploy Command**: `npm run deploy:admin`
* **Environment Variables (`.env.admin`)**:
  ```env
  VITE_APP_MODE=admin
  VITE_API_URL=https://furnitura-api.onrender.com
  VITE_FIREBASE_API_KEY=AIzaSy...
  VITE_FIREBASE_AUTH_DOMAIN=furnitura-luxury.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=furnitura-luxury
  ```
* **Behavior**:
  * Directly serves the Admin Command Center dashboard.
  * Enforces Firebase authentication & role-based access control (RBAC).
  * Includes inventory management, order tracking, MTN MoMo sandbox diagnostic panels, CMS, analytics, and audit logs.

### C. Deploy Both Workers in One Step
```bash
# Build both workers and backend
npm run build:all

# Deploy both Cloudflare Workers
npm run deploy:all
```

---

## 5. 🔍 Health Checks & Validation Endpoints

* **Root Status**: `GET https://furnitura-api.onrender.com/`
* **Health Check**: `GET https://furnitura-api.onrender.com/health`
* **Database Health**: `GET https://furnitura-api.onrender.com/health/database`
* **MTN MoMo Diagnostics**: `GET https://furnitura-api.onrender.com/api/payments/mtn/config-status`
