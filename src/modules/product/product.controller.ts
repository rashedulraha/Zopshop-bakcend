import type { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const ProductController = {
  async createProduct(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const product = await ProductService.createProduct(req.body, storeId);

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllProducts(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const result = await ProductService.getAllProducts(storeId, req.query);

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductById(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const product = await ProductService.getProductById(id, storeId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const updatedProduct = await ProductService.updateProduct(
        id,
        storeId,
        req.body,
      );

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const id = req.params.id as string;

      const success = await ProductService.deleteProduct(id, storeId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(204).send(); // No content
    } catch (error) {
      next(error);
    }
  },

  async getProductsByCategory(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const categoryId = req.params.categoryId as string;

      const products = await ProductService.getProductsByCategory(
        categoryId,
        storeId,
      );

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },

  async searchProducts(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ) {
    try {
      const storeId = req.storeId!;
      const q = req.query.q as string;

      if (!q || typeof q !== "string") {
        return res.status(400).json({
          success: false,
          message: "Search query 'q' is required",
        });
      }

      const products = await ProductService.searchProducts(storeId, q);

      return res.status(200).json({
        success: true,
        message: "Search completed successfully",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },
};
