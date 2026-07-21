# Zopshop API Documentation

## 1. Project Overview

**What is Zopshop?**
Zopshop is a Universal Digital Ledger System and backend SaaS platform.
**Who is it for?**
Any business type (grocery, pharmacy, hardware, wholesale, retail, etc.) needing to manage their business operations digitally.
**Key Features:**

- Digital ledger for tracking daily business transactions
- Stock management and inventory tracking
- Credit and due tracking for customers and suppliers
- Advanced analytics and reporting

---

## 2. Base URL

- **Development:** `http://localhost:8000/api`
- **Production:** `[your-production-url]/api`

---

## 3. Authentication

- **Login Methods:** `better-auth` is used to provide secure Email/Password and Google OAuth login.
- **Session Management:** Sessions are maintained via secure HTTP-only cookies and/or Bearer tokens.
- **Protected Endpoints:** All endpoints (except public auth routes) require authentication (`requireAuth` middleware) and store access (`requireStore` middleware).

---

## 4. Response Format

### Success Format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "errors": null
}
```

### Error Format:

```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Status Codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (duplicate)
- `500`: Internal Server Error

---

## 5. Endpoint Documentation

### Auth (Public / API Provided by better-auth)

| Method | Endpoint            | Description            |
| ------ | ------------------- | ---------------------- |
| POST   | `/auth/sign-up`     | Register new user      |
| POST   | `/auth/sign-in`     | Login user             |
| POST   | `/auth/sign-out`    | Logout user            |
| GET    | `/auth/get-session` | Get current session    |
| GET    | `/auth/me`          | Custom session wrapper |

### Products (Protected)

| Method | Endpoint                 | Description     |
| ------ | ------------------------ | --------------- |
| POST   | `/products`              | Create product  |
| GET    | `/products`              | List products   |
| GET    | `/products/:id`          | Get product     |
| PUT    | `/products/:id`          | Update product  |
| DELETE | `/products/:id`          | Delete product  |
| GET    | `/products/category/:id` | Get by category |
| GET    | `/products/search`       | Search products |

### Parties (Protected)

| Method | Endpoint                    | Description                      |
| ------ | --------------------------- | -------------------------------- |
| POST   | `/parties`                  | Create party (Customer/Supplier) |
| GET    | `/parties`                  | List parties                     |
| GET    | `/parties/:id`              | Get party                        |
| PUT    | `/parties/:id`              | Update party                     |
| DELETE | `/parties/:id`              | Delete party                     |
| GET    | `/parties/:id/balance`      | Get balance                      |
| GET    | `/parties/:id/transactions` | Get transactions                 |

### Transactions (Protected)

| Method | Endpoint                      | Description                                |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | `/transactions`               | Create transaction (Sale/Purchase/Expense) |
| GET    | `/transactions`               | List transactions                          |
| GET    | `/transactions/:id`           | Get transaction                            |
| PUT    | `/transactions/:id`           | Update transaction                         |
| DELETE | `/transactions/:id`           | Delete transaction                         |
| GET    | `/transactions/daily-summary` | Daily summary                              |

### Reports (Protected)

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| GET    | `/reports/dashboard`        | Dashboard stats    |
| GET    | `/reports/daily`            | Daily report       |
| GET    | `/reports/outstanding`      | Outstanding report |
| GET    | `/reports/stock`            | Stock report       |
| GET    | `/reports/profit-loss`      | Profit/Loss        |
| GET    | `/reports/party-ledger/:id` | Party ledger       |
| GET    | `/reports/sales`            | Sales analytics    |

### Config & Category (Protected)

| Method | Endpoint             | Description     |
| ------ | -------------------- | --------------- |
| GET    | `/config`            | Get config      |
| PUT    | `/config`            | Update config   |
| GET    | `/config/store-info` | Get store info  |
| POST   | `/categories`        | Create category |
| GET    | `/categories`        | List categories |

### Stores (Protected)

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| GET    | `/stores` | List stores for user |
| POST   | `/stores` | Create new store     |

### Brands (Protected)

| Method | Endpoint  | Description  |
| ------ | --------- | ------------ |
| GET    | `/brands` | List brands  |
| POST   | `/brands` | Create brand |

### Stock (Protected)

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| GET    | `/stock/alerts`      | Get stock alerts      |
| POST   | `/stock/adjustments` | Adjust stock manually |

### HR (Protected)

| Method | Endpoint                | Description     |
| ------ | ----------------------- | --------------- |
| GET    | `/employees`            | List employees  |
| POST   | `/employees`            | Create employee |
| POST   | `/employees/attendance` | Mark attendance |
| POST   | `/employees/salary`     | Pay salary      |

### Finance (Protected)

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| GET    | `/accounts`            | List bank accounts  |
| POST   | `/accounts`            | Create bank account |
| GET    | `/finance/income`      | Get total income    |
| GET    | `/finance/expense`     | Get total expense   |
| GET    | `/finance/profit-loss` | Get profit/loss     |

### Delivery (Protected)

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| GET    | `/vehicles`              | List vehicles          |
| POST   | `/vehicles`              | Create vehicle         |
| GET    | `/deliveries`            | List deliveries        |
| POST   | `/deliveries`            | Create delivery        |
| PUT    | `/deliveries/:id/status` | Update delivery status |

### Users & Roles (Protected)

| Method | Endpoint       | Description      |
| ------ | -------------- | ---------------- |
| GET    | `/users`       | List all users   |
| GET    | `/roles`       | List roles       |
| GET    | `/permissions` | List permissions |

### Settings (Protected)

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/settings/tax`      | Get tax settings    |
| GET    | `/settings/backup`   | Get backup info     |
| GET    | `/settings/security` | Get security config |

---

## 6. Example Requests & Responses

### 1. Product Creation

**Request:** `POST /api/products`

```json
{
  "name": "Cement Bag",
  "categoryId": "cat_123",
  "unit": "bag",
  "price": 500,
  "purchasePrice": 450,
  "stock": 100
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Cement Bag",
    "stock": 100
  },
  "message": "Product created successfully",
  "errors": null
}
```

### 2. Transaction Creation (Sale)

**Request:** `POST /api/transactions`

```json
{
  "partyId": "party_123",
  "type": "SALE",
  "mode": "CREDIT",
  "amount": 1000,
  "paidAmount": 500,
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "unitPrice": 500
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionId": "txn_123",
    "invoiceNo": "SAL-123456",
    "dueAmount": 500
  },
  "message": "Transaction recorded successfully",
  "errors": null
}
```

### 3. Dashboard Report

**Request:** `GET /api/reports/dashboard`
**Response:**

```json
{
  "success": true,
  "data": {
    "totalSales": 50000,
    "totalPurchases": 30000,
    "totalOutstanding": 5000,
    "netProfit": 15000
  },
  "message": "Dashboard statistics fetched successfully",
  "errors": null
}
```

---

## 7. Database Schema

### Key Relations

- `User` (1) --- (M) `Store`
- `Store` (1) --- (M) `Product`, `Category`, `Party`, `Transaction`
- `Product` (M) --- (1) `Category`
- `Transaction` (1) --- (M) `TransactionItem`
- `TransactionItem` (M) --- (1) `Product`
- `Transaction` (M) --- (1) `Party`

### Key Fields:

- **Party Type:** Configures if a party is `CUSTOMER`, `SUPPLIER`, or `BOTH`.
- **Transaction Type:** `SALE`, `PURCHASE`, `EXPENSE`, `PAYMENT_RECEIVED`, `PAYMENT_SENT`.
- **Stock:** Maintained on `Product`. Deducted/added based on `TransactionType`.

---

## 8. Environment Variables

- `PORT`: Server port (e.g., 8000)
- `DATABASE_URL`: Connection string for PostgreSQL
- `BETTER_AUTH_SECRET`: Secret key for better-auth session signing
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: OAuth credentials
- `RESEND_API_KEY`: API key for email delivery
- `FRONTEND_URL`: CORS allowed origin
- `NODE_ENV`: Runtime environment (`development` or `production`)

---

## 9. Deployment Guide

### Vercel (Frontend)

1. Import your frontend repository in Vercel.
2. Set Environment Variables including `NEXT_PUBLIC_API_URL` pointing to your deployed backend.
3. Deploy!

### Render / Railway (Backend)

1. Create a new Web Service from your GitHub repository.
2. Build Command: `npm run build`
3. Start Command: `npm run start`
4. **Environment Variables**: Add all variables from `.env`.
5. Add a Managed PostgreSQL Database and connect `DATABASE_URL`.
6. Run Migrations: Add `npx prisma db push` to a post-build script or run it manually.

### Database Migration Steps (Production)

1. Open deployment console / shell.
2. Run `npx prisma db push` (or `npx prisma migrate deploy` if using migration files).
3. Optionally seed the database: `npm run prisma:seed`.

---

## Checklist Before Deployment

- [x] All routes working
- [x] Authentication working
- [x] All CRUD operations working
- [x] Transaction logic (stock & balance updates) working
- [x] Reports generating correct data
- [x] Error handling for all cases
- [x] Environment variables configured
- [x] Database migrations applied
- [x] Seed data loaded
