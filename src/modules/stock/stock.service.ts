import { prisma } from "../../lib/prisma.js";

export const StockService = {
  async getStockAlerts(storeId: string) {
    // Find products where stock is less than or equal to minStock
    return prisma.product.findMany({
      where: {
        storeId,
        stock: {
          lte: prisma.product.fields.minStock
        }
      },
      include: {
        category: true,
        brand: true,
      },
      orderBy: { stock: "asc" },
    });
  },

  async adjustStock(productId: string, quantity: number, storeId: string, note?: string) {
    // Adjust stock (can be positive or negative)
    const product = await prisma.product.findUnique({
      where: { id: productId, storeId }
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity
        }
      }
    });

    // We might want to log this in a StockAdjustment table in the future,
    // but for now, updating the product stock directly.
    return updatedProduct;
  }
};
