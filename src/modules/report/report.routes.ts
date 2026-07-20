import { Router } from "express";
import { ReportController } from "./report.controller.js";

const router = Router();

router.get("/dashboard", ReportController.getDashboardStats);
router.get("/daily", ReportController.getDailyReport);
router.get("/outstanding", ReportController.getOutstandingReport);
router.get("/stock", ReportController.getStockReport);
router.get("/profit-loss", ReportController.getProfitLossReport);
router.get("/party-ledger/:partyId", ReportController.getPartyLedger);
router.get("/sales", ReportController.getSalesReport);

export const reportRoutes = router;
