import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import type { ApiResponse } from "../types/index.js";

export const requireSuperAdmin = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Not logged in",
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isSuperAdmin: true, role: true },
    });

    if (!dbUser || (!dbUser.isSuperAdmin && dbUser.role !== "SUPERADMIN")) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Requires Super Admin privileges",
      });
    }

    return next();
  } catch (error) {
    console.error("Super Admin Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authorization",
    });
  }
};
