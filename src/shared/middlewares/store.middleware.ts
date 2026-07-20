import type { NextFunction, Request, Response } from "express";
import type { ApiResponse } from "../types/index.js";

export const requireStore = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    // Make sure requireAuth was called before this
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }

    const storeId = req.user.storeId;

    if (!storeId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - No store assigned to this user",
      });
    }

    // Attach storeId to request for easy access in controllers
    req.storeId = storeId;
    
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in Store Middleware",
    });
  }
};
