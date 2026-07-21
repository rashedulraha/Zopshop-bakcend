import type { Request, Response, NextFunction } from "express";
import { SettingsService } from "./settings.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const SettingsController = {
  async getTaxSettings(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const taxSettings = await SettingsService.getTaxSettings(storeId);

      return res.status(200).json({
        success: true,
        message: "Tax settings fetched successfully",
        data: taxSettings,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBackupSettings(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const backupSettings = await SettingsService.getBackupSettings(storeId);

      return res.status(200).json({
        success: true,
        message: "Backup settings fetched successfully",
        data: backupSettings,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSecuritySettings(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const securitySettings = await SettingsService.getSecuritySettings(storeId);

      return res.status(200).json({
        success: true,
        message: "Security settings fetched successfully",
        data: securitySettings,
      });
    } catch (error) {
      next(error);
    }
  }
};
