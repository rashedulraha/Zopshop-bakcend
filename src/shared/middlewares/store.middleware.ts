import type { NextFunction, Request, Response } from "express";
import type { ApiResponse } from "../types/index.js";
import { prisma } from "../../lib/prisma.js";

export const requireStore = async (
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

    const headerStoreId = req.headers["x-store-id"] as string;

    // Fetch fresh user from DB to get the latest storeId (session might be stale)
    const freshUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { storeId: true },
    });

    const storeId = freshUser?.storeId || req.user.storeId || headerStoreId;

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
