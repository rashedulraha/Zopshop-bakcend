import { prisma } from "../../lib/prisma.js";

interface CreateProductDTO {
  name: string;
  categoryId?: string;
  unit: string;
  price: number;
  purchasePrice?: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  attributes?: Record<string, any>;
}

interface UpdateProductDTO extends Partial<CreateProductDTO> {}

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const ProductService = {
  async createProduct(data: CreateProductDTO, storeId: string) {
    return await prisma.product.create({
      data: {
        ...data,
        storeId,
        purchasePrice: data.purchasePrice ?? 0,
      },
    });
  },

  async getAllProducts(storeId: string, filters: ProductFilters) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { storeId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  },

  async getProductById(id: string, storeId: string) {
    return await prisma.product.findFirst({
      where: { id, storeId },
      include: { category: true },
    });
  },

  async updateProduct(id: string, storeId: string, data: UpdateProductDTO) {
    // Check if product exists in this store first to avoid updating someone else's product
    const product = await prisma.product.findFirst({ where: { id, storeId } });
    
    if (!product) {
      return null;
    }

    return await prisma.product.update({
      where: { id },
      data,
    });
  },

  async deleteProduct(id: string, storeId: string) {
    const product = await prisma.product.findFirst({ where: { id, storeId } });
    
    if (!product) {
      return false;
    }

    await prisma.product.delete({
      where: { id },
    });
    
    return true;
  },

  async getProductsByCategory(categoryId: string, storeId: string) {
    return await prisma.product.findMany({
      where: { categoryId, storeId },
      orderBy: { name: "asc" },
    });
  },

  async searchProducts(storeId: string, query: string) {
    return await prisma.product.findMany({
      where: {
        storeId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          {
            attributes: {
              path: [],
              string_contains: query,
            },
          },
        ],
      },
      take: 20, // Limit search results
    });
  },
};
