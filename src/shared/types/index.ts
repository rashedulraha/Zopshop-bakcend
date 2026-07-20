import type { Request } from "express";

// Base User type mimicking better-auth session user or Prisma user
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  image?: string | null;
  role: string;
  storeId?: string | null;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      storeId?: string;
    }
  }
}

// Standard API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}
