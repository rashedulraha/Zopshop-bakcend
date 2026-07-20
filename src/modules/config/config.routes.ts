import { Router } from "express";
import { ConfigController } from "./config.controller.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
import { updateConfigSchema } from "./config.validator.js";

const router = Router();

router.get("/", ConfigController.getConfig);
router.put("/", validateRequest(updateConfigSchema), ConfigController.updateConfig);
router.get("/store-info", ConfigController.getStoreInfo);

export const configRoutes = router;
