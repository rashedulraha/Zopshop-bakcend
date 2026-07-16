import { toNodeHandler } from "better-auth/node";
import { Router } from "express";
import { auth } from "../../lib/auth.js";

const route = Router();
export const authRoute = route;

// console.log("Hello");
route.all("/{*any}", toNodeHandler(auth));
