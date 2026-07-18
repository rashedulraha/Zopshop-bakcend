import { Router } from "express";
import { meControllers } from "./me.controller.js";

const route = Router();

route.get("/", meControllers.me);
export const meRouter = route;
