import { Router } from "express";
import { StockController } from "./stock.controller.js";

const router = Router();

router.get("/alerts", StockController.getStockAlerts);
router.post("/adjustments", StockController.adjustStock);

export const stockRoutes = router;
