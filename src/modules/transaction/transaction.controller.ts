import type { Request, Response, NextFunction } from "express";
import { TransactionService } from "./transaction.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const TransactionController = {
  async createTransaction(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const userId = req.user?.id;

      const transaction = await TransactionService.createTransaction(
        req.body,
        storeId,
        userId,
      );

      return res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllTransactions(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const result = await TransactionService.getAllTransactions(
        storeId,
        req.query as any,
      );

      return res.status(200).json({
        success: true,
        message: "Transactions fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTransactionById(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const transaction = await TransactionService.getTransactionById(
        id,
        storeId,
      );

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Transaction fetched successfully",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTransaction(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const updatedTransaction = await TransactionService.updateTransaction(
        id,
        storeId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Transaction updated successfully",
        data: updatedTransaction,
      });
    } catch (error: any) {
      if (error.message === "Transaction not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  async deleteTransaction(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const success = await TransactionService.deleteTransaction(id, storeId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getDailySummary(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const dateStr = req.query.date as string | undefined;

      const summary = await TransactionService.getDailySummary(
        storeId,
        dateStr,
      );

      return res.status(200).json({
        success: true,
        message: "Daily summary fetched successfully",
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },
};
