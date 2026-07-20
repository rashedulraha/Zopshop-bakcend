import { Router } from "express";
import { ResendControllers } from "./resend.controller.js";

const route = Router();

route.get("/email", ResendControllers.resend);

export const ResendRouter = route;
