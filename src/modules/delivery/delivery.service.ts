import { prisma } from "../../lib/prisma.js";
import type { DeliveryStatus } from "../../generated/prisma/client.js";

export const DeliveryService = {
  async getAllDeliveries(storeId: string, status?: DeliveryStatus) {
    const where: any = { storeId };
    if (status) {
      where.status = status;
    }

    return prisma.delivery.findMany({
      where,
      include: {
        transaction: { select: { invoiceNo: true, party: { select: { name: true } } } },
        vehicle: true,
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async createDelivery(data: any, storeId: string) {
    return prisma.delivery.create({
      data: {
        ...data,
        storeId,
      },
    });
  },

  async updateDeliveryStatus(id: string, status: DeliveryStatus, storeId: string) {
    const delivery = await prisma.delivery.findUnique({ where: { id, storeId } });
    
    if (!delivery) {
      throw new Error("Delivery not found");
    }

    return prisma.delivery.update({
      where: { id },
      data: { status }
    });
  },

  async getAllVehicles(storeId: string) {
    return prisma.vehicle.findMany({
      where: { storeId },
      orderBy: { name: "asc" }
    });
  },
  
  async createVehicle(data: any, storeId: string) {
    return prisma.vehicle.create({
      data: { ...data, storeId }
    });
  }
};
