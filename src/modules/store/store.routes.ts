import { Router } from "express";
import { StoreController } from "./store.controller.js";

const router = Router();

router.get("/", StoreController.getStores);
router.post("/", StoreController.createStore);

export const storeRoutes = router;
