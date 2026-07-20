import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import {
  errorHandler,
  notFoundHandler,
} from "./shared/middlewares/error.middleware.js";
import { requireAuth } from "./shared/middlewares/auth.middleware.js";
import { requireStore } from "./shared/middlewares/store.middleware.js";

// Existing routes
import { authRoute } from "./module/auth/auth.route.js";
import { meRouter } from "./module/me/me.route.js";

export const app: Application = express();

// =======================
// Global Middlewares
// =======================
app.use(
  cors({
    origin:
      config.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.FRONTEND_URL || "http://localhost:3000",
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

app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

// =======================
// API Routes
// =======================

// Auth routes (better-auth)
app.use("/api/auth", authRoute);

// Current user routes
app.use("/api/me", requireAuth, meRouter);

import { productRoutes } from "./modules/product/product.routes.js";

// --- Modules Placeholders (Protected + Store Bound) ---
// Example implementation pattern:
// app.use("/api/categories", requireAuth, requireStore, categoryRoutes);
app.use("/api/products", requireAuth, requireStore, productRoutes);
// app.use("/api/parties", requireAuth, requireStore, partyRoutes);
// app.use("/api/transactions", requireAuth, requireStore, transactionRoutes);
// app.use("/api/reports", requireAuth, requireStore, reportRoutes);
// app.use("/api/store", requireAuth, storeRoutes); // Store settings, might not need requireStore if managing stores

// =======================
// Error Handling
// =======================
app.use(notFoundHandler);
app.use(errorHandler);
