# FURNITURA — Production Deployment & Cloud Architecture Guide

This guide details the step-by-step setup and live deployment of the **FURNITURA Luxury Commerce** application across Cloudflare Pages, Render, MongoDB Atlas, Firebase Authentication, and MTN MoMo Sandbox.

---

## 🏛️ Target Cloud Architecture

```
                    ┌────────────────────────┐
                    │  CUSTOMER STOREFRONT   │
                    │    Cloudflare Pages    │
                    │ (VITE_APP_MODE=client) │
                    └───────────┬────────────┘
                                │ HTTPS (VITE_API_URL)
                                ▼
                    ┌────────────────────────┐
                    │      RENDER API        │
                    │ Express + TS + Mongoose│
                    │ MTN MoMo + RBAC Server │
                    └──────┬─────────┬───────┘
                           │         │
                           ▼         ▼
                ┌────────────────┐  ┌───────────────┐
                │ MONGODB ATLAS  │  │   FIREBASE    │
                │  Production DB │  │ Authentication │
                └────────────────┘  └───────────────┘
                                ▲
                                │ HTTPS (VITE_API_URL)
                    ┌───────────┴────────────┐
                    │    ADMIN DASHBOARD     │
                    │    Cloudflare Pages    │
                    │  (VITE_APP_MODE=admin) │
                    └────────────────────────┘
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
4. **Web App Credentials (for Cloudflare Pages)**:
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
   * `CORS_ORIGINS`: `https://furnitura.pages.dev,https://admin-furnitura.pages.dev`

---

## 4. ⚡ Frontend Deployment Modes (Cloudflare Pages)

Both modes use the same Render API via `VITE_API_URL`.

### A. Customer Storefront Mode
* **Deployment URL**: `https://furnitura.pages.dev`
* **Environment Variables**:
  ```env
  VITE_APP_MODE=client
  VITE_API_URL=https://furnitura-api.onrender.com
  VITE_FIREBASE_API_KEY=AIzaSy...
  VITE_FIREBASE_AUTH_DOMAIN=furnitura-luxury.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=furnitura-luxury
  ```
* **Behavior**:
  * Shows only the customer storefront.
  * Admin dashboard navigation, admin buttons, and shortcut triggers are hidden.

### B. Admin Command Center Mode
* **Deployment URL**: `https://admin-furnitura.pages.dev`
* **Environment Variables**:
  ```env
  VITE_APP_MODE=admin
  VITE_API_URL=https://furnitura-api.onrender.com
  VITE_FIREBASE_API_KEY=AIzaSy...
  VITE_FIREBASE_AUTH_DOMAIN=furnitura-luxury.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=furnitura-luxury
  ```
* **Behavior**:
  * Shows the Admin Command Center.
  * Requires Firebase authentication and enforces server-side RBAC.
  * Does not expose public storefront as primary application.

---

## 5. 🔍 Health Checks & Validation Endpoints

* **Root Status**: `GET https://furnitura-api.onrender.com/`
* **Health Check**: `GET https://furnitura-api.onrender.com/health`
* **Database Health**: `GET https://furnitura-api.onrender.com/health/database`
* **MTN MoMo Diagnostics**: `GET https://furnitura-api.onrender.com/api/payments/mtn/config-status`
