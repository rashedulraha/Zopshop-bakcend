import { prisma } from "../../lib/prisma.js";

export const BrandService = {
  async getAllBrands(storeId: string) {
    return prisma.brand.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  },

  async createBrand(name: string, storeId: string) {
    return prisma.brand.create({
      data: {
        name,
        storeId,
      },
    });
  }
};
