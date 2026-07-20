import { toNodeHandler } from "better-auth/node";
import { Router } from "express";
import { auth } from "../../lib/auth.js";

export const authRoute = Router();
authRoute.all("/{*any}", toNodeHandler(auth));
