import type { NextFunction, Request, Response } from "express";
import { auth } from "../../lib/auth.js";
import type { ApiResponse, AuthUser } from "../types/index.js";

export const requireAuth = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as unknown as Headers,
    });

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No session found",
      });
    }

    // Attach user to request
    req.user = session.user as unknown as AuthUser;
    
    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid session",
    });
  }
};
