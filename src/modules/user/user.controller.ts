import type { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const UserController = {
  async getAllUsers(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const users = await UserService.getAllUsers(storeId);

      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllRoles(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const roles = await UserService.getAllRoles(storeId);

      return res.status(200).json({
        success: true,
        message: "Roles fetched successfully",
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllPermissions(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const permissions = await UserService.getAllPermissions();

      return res.status(200).json({
        success: true,
        message: "Permissions fetched successfully",
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }
};
