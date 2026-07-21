import { prisma } from "../../lib/prisma.js";

export const StoreService = {
  async getStoresByUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
      },
    });

    return user?.store ? [user.store] : [];
  },

  async createStore(
    data: { name: string; businessType: string },
    userId: string,
  ) {
    const store = await prisma.store.create({
      data: {
        name: data.name,
        businessType: data.businessType,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { storeId: store.id },
    });

    return store;
  },
};
