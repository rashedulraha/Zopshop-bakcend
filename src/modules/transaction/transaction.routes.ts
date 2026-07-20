import { Router } from "express";
import { TransactionController } from "./transaction.controller.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "./transaction.validator.js";

const router = Router();

router.post(
  "/",
  validateRequest(createTransactionSchema),
  TransactionController.createTransaction,
);
router.get("/", TransactionController.getAllTransactions);
router.get("/daily-summary", TransactionController.getDailySummary);
router.get("/:id", TransactionController.getTransactionById);
router.put(
  "/:id",
  validateRequest(updateTransactionSchema),
  TransactionController.updateTransaction,
);
router.delete("/:id", TransactionController.deleteTransaction);

export const transactionRoutes = router;
