import { prisma } from "../../lib/prisma.js";

interface UpdateConfigDTO {
  enableCredit?: boolean;
  enableStock?: boolean;
  enableExpense?: boolean;
  currency?: string;
  dateFormat?: string;
  businessType?: string;
  customFields?: Record<string, any>;
}

export const ConfigService = {
  async getConfig(storeId: string) {
    let config = await prisma.config.findUnique({
      where: { storeId },
    });

    if (!config) {
      // Create default config if it doesn't exist
      config = await prisma.config.create({
        data: {
          storeId,
          enableCredit: true,
          enableStock: true,
          enableExpense: true,
          currency: "BDT",
          dateFormat: "DD-MM-YYYY",
          customFields: {},
        },
      });
    }

    return config;
  },

  async updateConfig(storeId: string, data: UpdateConfigDTO) {
    // Ensure config exists first
    await this.getConfig(storeId);

    const updateData: any = { ...data };

    // Explicitly handle customFields to bypass TS strict typing with Prisma Json
    if (data.customFields !== undefined) {
      updateData.customFields = data.customFields as any;
    }

    return await prisma.config.update({
      where: { storeId },
      data: updateData,
    });
  },

  async getStoreInfo(storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        businessType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!store) {
      throw new Error("Store not found");
    }

    return store;
  },
};
