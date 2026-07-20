import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import type { ApiResponse } from "../types/index.js";

export const validateRequest =
  (schema: ZodSchema) =>
  async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: error.flatten().fieldErrors,
        });
      }
      return next(error);
    }
  };
