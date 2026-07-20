import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { ApiResponse } from "../types/index.js";

// Basic global error handler
export const errorHandler = (
  err: any,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
) => {
  console.error("Error occurred:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.flatten().fieldErrors;
  }
  // Basic check for Prisma errors (you can expand this with Prisma.PrismaClientKnownRequestError later)
  else if (err?.code && typeof err.code === "string" && err.code.startsWith("P2")) {
    statusCode = 400;
    message = "Database Error";
    if (err.code === "P2002") {
      message = "Unique constraint failed";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

// 404 Not Found Handler
export const notFoundHandler = (
  req: Request,
  res: Response<ApiResponse>,
) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
