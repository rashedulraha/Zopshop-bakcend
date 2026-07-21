import { prisma } from "../../lib/prisma.js";

interface CreateCategoryDTO {
  name: string;
}

interface UpdateCategoryDTO {
  name?: string;
}

export const CategoryService = {
  async createCategory(data: CreateCategoryDTO, storeId: string) {
    // Unique constraint on [name, storeId] handles uniqueness
    try {
      return await prisma.category.create({
        data: {
          ...data,
          storeId,
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("Category with this name already exists in your store");
      }
      throw error;
    }
  },

  async getAllCategories(storeId: string) {
    return await prisma.category.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  async getCategoryById(id: string, storeId: string) {
    return await prisma.category.findFirst({
      where: { id, storeId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  },

  async updateCategory(id: string, storeId: string, data: UpdateCategoryDTO) {
    const category = await prisma.category.findFirst({
      where: { id, storeId },
    });

    if (!category) return null;

    try {
      return await prisma.category.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("Category with this name already exists in your store");
      }
      throw error;
    }
  },

  async deleteCategory(id: string, storeId: string) {
    const category = await prisma.category.findFirst({
      where: { id, storeId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    if (category._count.products > 0) {
      throw new Error(
        "Cannot delete category because it has associated products",
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return true;
  },
};
