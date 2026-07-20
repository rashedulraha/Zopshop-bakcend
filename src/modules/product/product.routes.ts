import { Router } from "express";
import { ProductController } from "./product.controller.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "./product.validator.js";

const router = Router();

router.post(
  "/",
  validateRequest(createProductSchema),
  ProductController.createProduct,
);
router.get("/", ProductController.getAllProducts);
router.get("/search", ProductController.searchProducts);
router.get("/category/:categoryId", ProductController.getProductsByCategory);
router.get("/:id", ProductController.getProductById);
router.put(
  "/:id",
  validateRequest(updateProductSchema),
  ProductController.updateProduct,
);
router.delete("/:id", ProductController.deleteProduct);

export const productRoutes = router;
