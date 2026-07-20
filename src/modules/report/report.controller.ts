import type { Request, Response, NextFunction } from "express";
import { ReportService } from "./report.service.js";
import type { ApiResponse } from "../../shared/types/index.js";
import type { PartyTypeEnum } from "../../shared/utils/constants.js";

export const ReportController = {
  async getDashboardStats(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const stats = await ReportService.getDashboardStats(storeId);
      return res.status(200).json({ success: true, message: "Dashboard stats fetched", data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getDailyReport(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const date = req.query.date as string | undefined;
      const report = await ReportService.getDailyReport(storeId, date);
      return res.status(200).json({ success: true, message: "Daily report fetched", data: report });
    } catch (error) {
      next(error);
    }
  },

  async getOutstandingReport(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const type = req.query.type as PartyTypeEnum | undefined;
      const report = await ReportService.getOutstandingReport(storeId, type);
      return res.status(200).json({ success: true, message: "Outstanding report fetched", data: report });
    } catch (error) {
      next(error);
    }
  },

  async getStockReport(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const lowStock = req.query.lowStock as string | undefined;
      const threshold = req.query.threshold as string | undefined;
      const report = await ReportService.getStockReport(storeId, lowStock, threshold);
      return res.status(200).json({ success: true, message: "Stock report fetched", data: report });
    } catch (error) {
      next(error);
    }
  },

  async getProfitLossReport(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      const report = await ReportService.getProfitLossReport(storeId, from, to);
      return res.status(200).json({ success: true, message: "Profit/Loss report fetched", data: report });
    } catch (error) {
      next(error);
    }
  },

  async getPartyLedger(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const partyId = req.params.partyId as string;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      
      const report = await ReportService.getPartyLedger(storeId, partyId, from, to);
      return res.status(200).json({ success: true, message: "Party ledger fetched", data: report });
    } catch (error: any) {
      if (error.message === "Party not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async getSalesReport(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day';
      
      const report = await ReportService.getSalesReport(storeId, from, to, groupBy);
      return res.status(200).json({ success: true, message: "Sales report fetched", data: report });
    } catch (error) {
      next(error);
    }
  },
};
