import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().positive("Price must be a positive number"),
  purchasePrice: z.number().nonnegative("Purchase price must be non-negative").optional(),
  stock: z.number().nonnegative("Stock cannot be negative").default(0).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  attributes: z.record(z.string(), z.any()).optional(),
});

export const updateProductSchema = createProductSchema.partial();
