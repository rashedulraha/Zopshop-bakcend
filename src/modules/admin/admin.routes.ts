import { Router } from "express";
import {
  getAllUsers,
  updateUserStatus,
  updateSubscription,
} from "./admin.controller.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
import { requireSuperAdmin } from "../../shared/middlewares/admin.middleware.js";

export const adminRoutes = Router();

// All routes require valid auth and super admin role
adminRoutes.use(requireAuth);
adminRoutes.use(requireSuperAdmin);

adminRoutes.get("/users", getAllUsers);
adminRoutes.patch("/users/:id/status", updateUserStatus);
adminRoutes.patch("/users/:id/subscription", updateSubscription);
