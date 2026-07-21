import type { Request, Response, NextFunction } from "express";
import { FinanceService } from "./finance.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const FinanceController = {
  async getAccounts(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const accounts = await FinanceService.getAccounts(storeId);

      return res.status(200).json({
        success: true,
        message: "Accounts fetched successfully",
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  },

  async createAccount(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: "Account name is required" });
      }

      const account = await FinanceService.createAccount(req.body, storeId);

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: account,
      });
    } catch (error) {
      next(error);
    }
  },

  async getIncome(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const { from, to } = req.query as { from?: string; to?: string };
      const income = await FinanceService.getIncome(storeId, from, to);

      return res.status(200).json({
        success: true,
        message: "Income records fetched successfully",
        data: income,
      });
    } catch (error) {
      next(error);
    }
  },

  async getExpense(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const { from, to } = req.query as { from?: string; to?: string };
      const expense = await FinanceService.getExpense(storeId, from, to);

      return res.status(200).json({
        success: true,
        message: "Expense records fetched successfully",
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfitLoss(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const { from, to } = req.query as { from?: string; to?: string };
      const pl = await FinanceService.getProfitLoss(storeId, from, to);

      return res.status(200).json({
        success: true,
        message: "Profit & Loss fetched successfully",
        data: pl,
      });
    } catch (error) {
      next(error);
    }
  }
};
