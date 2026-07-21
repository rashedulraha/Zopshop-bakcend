import { Router } from "express";
import { DeliveryController } from "./delivery.controller.js";

const router = Router();

// Vehicles
router.get("/vehicles", DeliveryController.getAllVehicles);
router.post("/vehicles", DeliveryController.createVehicle);

// Deliveries
router.get("/deliveries", DeliveryController.getAllDeliveries);
router.post("/deliveries", DeliveryController.createDelivery);
router.put("/deliveries/:id/status", DeliveryController.updateDeliveryStatus);

export const deliveryRoutes = router;
