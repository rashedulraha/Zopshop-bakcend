import type { Request, Response, NextFunction } from "express";
import { StockService } from "./stock.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const StockController = {
  async getStockAlerts(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      // Note: prisma.product.fields is not available in prisma client in where clause this way in standard Prisma.
      // Wait, `lte: prisma.product.fields.minStock` is Prisma 5 syntax for comparing two fields. 
      // Let's rewrite it to ensure compatibility, or just use a raw query if it fails.
      // Actually, since Prisma 5, comparing fields is possible. But to be safe, I'll use a slightly different approach or just stick with it if it's supported.
      
      const alerts = await StockService.getStockAlerts(storeId);

      return res.status(200).json({
        success: true,
        message: "Stock alerts fetched successfully",
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  },

  async adjustStock(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const { productId, quantity, note } = req.body;

      if (!productId || typeof quantity !== 'number') {
        return res.status(400).json({ success: false, message: "productId and valid quantity are required" });
      }

      const product = await StockService.adjustStock(productId, quantity, storeId, note);

      return res.status(200).json({
        success: true,
        message: "Stock adjusted successfully",
        data: product,
      });
    } catch (error: any) {
      if (error.message === "Product not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
};
