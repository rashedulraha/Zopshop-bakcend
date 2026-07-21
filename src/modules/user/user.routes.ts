import { Router } from "express";
import { UserController } from "./user.controller.js";

const router = Router();

router.get("/users", UserController.getAllUsers);
router.get("/roles", UserController.getAllRoles);
router.get("/permissions", UserController.getAllPermissions);

export const userRoutes = router;
