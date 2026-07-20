# Zopshop SAAS Server (Backend)

Backend API server for the Zopshop SaaS platform, built with Node.js, Express, and TypeScript. It uses Prisma ORM with PostgreSQL for database management, `better-auth` for complete authentication, and Resend for email services.

## 🚀 Features

- **Authentication:** Integrated `better-auth` for secure user authentication (Session-based, Google OAuth, Email Verification).
- **Store Management:** Multi-tenant architecture supporting multiple stores per user.
- **Product & Category:** Full management of products, categories, stock, and pricing.
- **Transaction System:** Manage sales, purchases, expenses, and payment receipts.
- **Party Management:** Keep track of customers, suppliers, and their balances.
- **Reports & Configurations:** Generate business reports and manage store configurations.
- **Email Service:** Powered by Resend for transactional emails.

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js (v5)
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** PostgreSQL (via `@prisma/adapter-pg` & `pg`)
- **Authentication:** better-auth
- **Email:** Resend
- **Validation:** Zod

## 📁 Project Structure

```text
src/
├── config/        # Environment and app configuration
├── lib/           # Third-party libraries initialization (Prisma, Better-Auth, etc.)
├── modules/       # Domain-driven modules
│   ├── auth/      # Unified authentication routes and controllers
│   ├── category/  # Product category management
│   ├── config/    # Store configurations
│   ├── party/     # Customer and supplier management
│   ├── product/   # Product and inventory management
│   ├── report/    # Analytical reports
│   ├── resend/    # Email services using Resend
│   ├── store/     # Store multi-tenancy management
│   ├── transaction/ # Business transactions (Sales, Purchases)
│   └── user/      # User management
├── shared/        # Shared middlewares and utilities (auth, error handling, etc.)
├── app.ts         # Express App configuration
└── server.ts      # Entry point
```

## 📚 API Documentation

For complete API reference, endpoint details, deployment guides, and request/response examples, please check the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL Database
- npm or yarn

### Installation

1. Clone the repository and navigate into the project directory:

   ```bash
   git clone <repository_url>
   cd Zopshop-bakcend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add the following keys:

   ```env
   NODE_ENV="development"
   PORT=8000
   FRONTEND_URL="http://localhost:3000"

   # Database URL for Prisma
   DATABASE_URL="postgresql://user:password@localhost:5432/zopshop"

   # Better Auth & OAuth Config
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"

   # Resend
   RESEND_API_KEY="your_resend_api_key"
   ```

   _(Note: Ensure you update the values with your actual credentials)_

4. Setup the Database:

   ```bash
   # Push schema to database
   npx prisma db push

   # Generate Prisma Client
   npx prisma generate
   ```

5. Seed the Database (Optional):
   ```bash
   npm run prisma:seed
   ```

### 🏃‍♂️ Running the Server

- **Development Mode:**
  ```bash
  npm run dev
  ```
- **Production Build:**
  ```bash
  npm run build
  npm start
  ```

## 📜 Available Scripts

- `npm run dev` - Start the development server using `tsx`.
- `npm run build` - Compile TypeScript code to JavaScript.
- `npm run start` - Run the compiled production build.
- `npm run lint` - Run ESLint on the source code.
- `npm run format` - Format code using Prettier.
- `npm run prisma:seed` - Run the database seeder to populate sample data.

## 📄 License

ISC License
