import type { Request, Response, NextFunction } from "express";
import { PartyService } from "./party.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const PartyController = {
  async createParty(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const party = await PartyService.createParty(req.body, storeId);

      return res.status(201).json({
        success: true,
        message: "Party created successfully",
        data: party,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllParties(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const result = await PartyService.getAllParties(storeId, req.query as any);

      return res.status(200).json({
        success: true,
        message: "Parties fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPartyById(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const party = await PartyService.getPartyById(id, storeId);

      if (!party) {
        return res.status(404).json({
          success: false,
          message: "Party not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Party fetched successfully",
        data: party,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateParty(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const updatedParty = await PartyService.updateParty(id, storeId, req.body);

      if (!updatedParty) {
        return res.status(404).json({
          success: false,
          message: "Party not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Party updated successfully",
        data: updatedParty,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteParty(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      await PartyService.deleteParty(id, storeId);

      return res.status(204).send(); // No content
    } catch (error: any) {
      if (error.message === "Party not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes("Cannot delete party")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  async getPartyBalance(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const balance = await PartyService.getPartyBalance(id, storeId);

      return res.status(200).json({
        success: true,
        message: "Party balance fetched successfully",
        data: { balance },
      });
    } catch (error: any) {
      if (error.message === "Party not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  async getPartyTransactions(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const result = await PartyService.getPartyTransactions(id, storeId, req.query as any);

      return res.status(200).json({
        success: true,
        message: "Party transactions fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
