import { Router } from "express";
import { SettingsController } from "./settings.controller.js";

const router = Router();

router.get("/tax", SettingsController.getTaxSettings);
router.get("/backup", SettingsController.getBackupSettings);
router.get("/security", SettingsController.getSecuritySettings);

export const settingsRoutes = router;
