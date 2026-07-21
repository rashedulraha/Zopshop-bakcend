import type { Request, Response, NextFunction } from "express";
import { StoreService } from "./store.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const StoreController = {
  async getStores(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const stores = await StoreService.getStoresByUser(userId);

      return res.status(200).json({
        success: true,
        message: "Stores fetched successfully",
        data: stores,
      });
    } catch (error) {
      next(error);
    }
  },

  async createStore(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { name, businessType } = req.body;
      if (!name || !businessType) {
        return res.status(400).json({ success: false, message: "Name and businessType are required" });
      }

      const store = await StoreService.createStore({ name, businessType }, userId);

      return res.status(201).json({
        success: true,
        message: "Store created successfully",
        data: store,
      });
    } catch (error) {
      next(error);
    }
  },
};
