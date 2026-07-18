import { Router } from "express";
import { signoutController } from "./signout.controller.js";

const route = Router();

export const signoutRoute = route;
route.post("/", signoutController);
