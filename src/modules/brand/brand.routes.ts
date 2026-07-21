import { Router } from "express";
import { BrandController } from "./brand.controller.js";

const router = Router();

router.get("/", BrandController.getAllBrands);
router.post("/", BrandController.createBrand);

export const brandRoutes = router;
