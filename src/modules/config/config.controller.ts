import type { Request, Response, NextFunction } from "express";
import { ConfigService } from "./config.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const ConfigController = {
  async getConfig(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const config = await ConfigService.getConfig(storeId);

      return res.status(200).json({
        success: true,
        message: "Config fetched successfully",
        data: config,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateConfig(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const config = await ConfigService.updateConfig(storeId, req.body);

      return res.status(200).json({
        success: true,
        message: "Config updated successfully",
        data: config,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStoreInfo(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const store = await ConfigService.getStoreInfo(storeId);

      return res.status(200).json({
        success: true,
        message: "Store info fetched successfully",
        data: store,
      });
    } catch (error: any) {
      if (error.message === "Store not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
};
