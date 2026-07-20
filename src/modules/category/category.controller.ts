import type { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const CategoryController = {
  async createCategory(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const category = await CategoryService.createCategory(req.body, storeId);

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  async getAllCategories(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const categories = await CategoryService.getAllCategories(storeId);

      return res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategoryById(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const category = await CategoryService.getCategoryById(id, storeId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category fetched successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const updatedCategory = await CategoryService.updateCategory(
        id,
        storeId,
        req.body,
      );

      if (!updatedCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  async deleteCategory(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      await CategoryService.deleteCategory(id, storeId);

      return res.status(204).send();
    } catch (error: any) {
      if (error.message === "Category not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes("Cannot delete category")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
};
