import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { authControllers } from "./auth.controller.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";

const route = Router();

// Custom endpoints (optional, as better-auth provides these by default)
route.get("/me", requireAuth, authControllers.me);
route.post("/signout", requireAuth, authControllers.signout);

// Mount better-auth's internal routes (must be catching all under /api/auth)
route.all("/{*any}", toNodeHandler(auth));
export const authRoutes = route;

