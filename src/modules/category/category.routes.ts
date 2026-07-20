import { Router } from "express";
import { CategoryController } from "./category.controller.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validator.js";

const router = Router();

router.post(
  "/",
  validateRequest(createCategorySchema),
  CategoryController.createCategory,
);
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);
router.put(
  "/:id",
  validateRequest(updateCategorySchema),
  CategoryController.updateCategory,
);
router.delete("/:id", CategoryController.deleteCategory);

export const categoryRoutes = router;
