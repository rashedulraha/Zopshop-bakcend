import type { Request, Response, NextFunction } from "express";
import { DeliveryService } from "./delivery.service.js";
import type { ApiResponse } from "../../shared/types/index.js";
import type { DeliveryStatus } from "../../generated/prisma/client.js";

export const DeliveryController = {
  async getAllDeliveries(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const status = req.query.status as DeliveryStatus | undefined;
      const deliveries = await DeliveryService.getAllDeliveries(storeId, status);

      return res.status(200).json({
        success: true,
        message: "Deliveries fetched successfully",
        data: deliveries,
      });
    } catch (error) {
      next(error);
    }
  },

  async createDelivery(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({ success: false, message: "transactionId is required" });
      }

      const delivery = await DeliveryService.createDelivery(req.body, storeId);

      return res.status(201).json({
        success: true,
        message: "Delivery created successfully",
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDeliveryStatus(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }

      const delivery = await DeliveryService.updateDeliveryStatus(id, status as DeliveryStatus, storeId);

      return res.status(200).json({
        success: true,
        message: "Delivery status updated successfully",
        data: delivery,
      });
    } catch (error: any) {
      if (error.message === "Delivery not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async getAllVehicles(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const vehicles = await DeliveryService.getAllVehicles(storeId);

      return res.status(200).json({
        success: true,
        message: "Vehicles fetched successfully",
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  },

  async createVehicle(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const { name, plateNumber } = req.body;
      
      if (!name || !plateNumber) {
         return res.status(400).json({ success: false, message: "name and plateNumber are required" });
      }

      const vehicle = await DeliveryService.createVehicle(req.body, storeId);

      return res.status(201).json({
        success: true,
        message: "Vehicle created successfully",
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }
};
