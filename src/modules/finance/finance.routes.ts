import { Router } from "express";
import { FinanceController } from "./finance.controller.js";

const router = Router();

router.get("/accounts", FinanceController.getAccounts);
router.post("/accounts", FinanceController.createAccount);

router.get("/finance/income", FinanceController.getIncome);
router.get("/finance/expense", FinanceController.getExpense);
router.get("/finance/profit-loss", FinanceController.getProfitLoss);

export const financeRoutes = router;
