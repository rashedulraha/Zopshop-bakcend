import { prisma } from "../../lib/prisma.js";

export const UserService = {
  async getAllUsers(storeId: string) {
    return prisma.user.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async getAllRoles(storeId: string) {
    return prisma.role.findMany({
      where: { storeId },
      include: {
        permissions: true
      },
      orderBy: { name: "asc" }
    });
  },

  async getAllPermissions() {
    return prisma.permission.findMany({
      orderBy: { name: "asc" }
    });
  }
};
