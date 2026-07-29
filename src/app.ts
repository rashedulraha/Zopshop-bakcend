import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { prisma } from "./lib/prisma.js";
import {
  errorHandler,
  notFoundHandler,
} from "./shared/middlewares/error.middleware.js";
import { requireAuth } from "./shared/middlewares/auth.middleware.js";
import { requireStore } from "./shared/middlewares/store.middleware.js";

// Existing routes
import { authRoutes } from "./modules/auth/auth.routes.js";

export const app: Application = express();

// =======================
// Global Middlewares & Security
// =======================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin:
      config.NODE_ENV === "development"
        ? ["http://localhost:3000", "http://127.0.0.1:3000"]
        : [config.FRONTEND_URL || "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// =======================
// Health Check & Base Routes
// =======================
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Zopshop API Server is running!" });
});

app.get("/health", async (req: Request, res: Response) => {
  let dbStatus = "disconnected";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err) {
    dbStatus = "error";
  }

  res.json({
    success: true,
    message: "Server is healthy",
    environment: config.NODE_ENV,
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// =======================
// API Routes
// =======================

// Auth routes (better-auth + custom me/signout)
app.use("/api/auth", authRoutes);



import { productRoutes } from "./modules/product/product.routes.js";

import { partyRoutes } from "./modules/party/party.routes.js";

import { transactionRoutes } from "./modules/transaction/transaction.routes.js";

import { reportRoutes } from "./modules/report/report.routes.js";

import { categoryRoutes } from "./modules/category/category.routes.js";
import { configRoutes } from "./modules/config/config.routes.js";
import { storeRoutes } from "./modules/store/store.routes.js";
import { brandRoutes } from "./modules/brand/brand.routes.js";
import { stockRoutes } from "./modules/stock/stock.routes.js";
import { hrRoutes } from "./modules/hr/hr.routes.js";
import { financeRoutes } from "./modules/finance/finance.routes.js";
import { deliveryRoutes } from "./modules/delivery/delivery.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { settingsRoutes } from "./modules/settings/settings.routes.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";

// --- Super Admin Routes (must be BEFORE generic /api routes) ---
app.use("/api/admin", adminRoutes);

// --- Modules Placeholders (Protected + Store Bound) ---
app.use("/api/stores", requireAuth, storeRoutes);
app.use("/api/brands", requireAuth, requireStore, brandRoutes);
app.use("/api/stock", requireAuth, requireStore, stockRoutes);
app.use("/api", requireAuth, requireStore, hrRoutes);
app.use("/api", requireAuth, requireStore, financeRoutes);
app.use("/api", requireAuth, requireStore, deliveryRoutes);
app.use("/api", requireAuth, requireStore, userRoutes);
app.use("/api/settings", requireAuth, requireStore, settingsRoutes);
app.use("/api/categories", requireAuth, requireStore, categoryRoutes);
app.use("/api/products", requireAuth, requireStore, productRoutes);
app.use("/api/parties", requireAuth, requireStore, partyRoutes);
app.use("/api/transactions", requireAuth, requireStore, transactionRoutes);
app.use("/api/reports", requireAuth, requireStore, reportRoutes);
app.use("/api/config", requireAuth, requireStore, configRoutes);

// =======================
// Error Handling
// =======================
app.use(notFoundHandler);
app.use(errorHandler);
