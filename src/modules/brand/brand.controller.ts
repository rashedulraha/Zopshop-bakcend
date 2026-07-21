import type { Request, Response, NextFunction } from "express";
import { BrandService } from "./brand.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const BrandController = {
  async getAllBrands(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const brands = await BrandService.getAllBrands(storeId);

      return res.status(200).json({
        success: true,
        message: "Brands fetched successfully",
        data: brands,
      });
    } catch (error) {
      next(error);
    }
  },

  async createBrand(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" });
      }

      const brand = await BrandService.createBrand(name, storeId);

      return res.status(201).json({
        success: true,
        message: "Brand created successfully",
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  }
};
