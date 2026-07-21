import type { Request, Response, NextFunction } from "express";
import { PartyService } from "./party.service.js";
import { TransactionService } from "../transaction/transaction.service.js";
import type { TransactionTypeEnum, TransactionModeEnum } from "../../shared/utils/constants.js";
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
      const result = await PartyService.getAllParties(
        storeId,
        req.query as any,
      );

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

      const updatedParty = await PartyService.updateParty(
        id,
        storeId,
        req.body,
      );

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

      const result = await PartyService.getPartyTransactions(
        id,
        storeId,
        req.query as any,
      );

      return res.status(200).json({
        success: true,
        message: "Party transactions fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPartyLedger(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const ledger = await PartyService.getPartyLedger(id, storeId);

      return res.status(200).json({
        success: true,
        message: "Party ledger fetched successfully",
        data: ledger,
      });
    } catch (error: any) {
      if (error.message === "Party not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async getPartiesWithDue(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const parties = await PartyService.getPartiesWithDue(storeId);

      return res.status(200).json({
        success: true,
        message: "Due parties fetched successfully",
        data: parties,
      });
    } catch (error) {
      next(error);
    }
  },

  async makePayment(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const userId = req.user?.id;
      const partyId = req.params.id as string;
      const { amount, mode, note, type } = req.body;

      if (!amount || !mode || !type) {
        return res.status(400).json({ success: false, message: "Amount, mode, and type are required" });
      }

      // type should be PAYMENT_RECEIVED or PAYMENT_SENT
      const transaction = await TransactionService.createTransaction(
        {
          partyId,
          type: type as TransactionTypeEnum,
          mode: mode as TransactionModeEnum,
          amount: Number(amount),
          note,
        },
        storeId,
        userId
      );

      return res.status(201).json({
        success: true,
        message: "Payment processed successfully",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  },
};
