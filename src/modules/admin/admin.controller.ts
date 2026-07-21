import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../shared/utils/appError.js";

// ─── Dashboard Stats ───────────────────────────────────────────────────────────

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalStores, totalUsers, activeUsers, recentStores] =
      await Promise.all([
        prisma.store.count(),
        prisma.user.count({ where: { isSuperAdmin: false } }),
        prisma.user.count({ where: { status: "ACTIVE", isSuperAdmin: false } }),
        prisma.store.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            users: {
              where: { isSuperAdmin: false },
              select: { name: true, subscriptionPlan: true, status: true },
              take: 1,
            },
          },
        }),
      ]);

    const recentStoresMapped = recentStores.map((s) => ({
      id: s.id,
      name: s.name,
      ownerName: s.users[0]?.name ?? null,
      plan: s.users[0]?.subscriptionPlan ?? "FREE",
      ownerStatus: s.users[0]?.status ?? "ACTIVE",
      createdAt: s.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalStores,
        totalUsers,
        activeUsers,
        recentStores: recentStoresMapped,
      },
    });
  } catch (error) {
    throw new AppError("Failed to fetch dashboard stats", 500);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isSuperAdmin: true,
        status: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    throw new AppError("Failed to fetch users", 500);
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
      throw new AppError("Invalid status", 400);
    }

    // ── Protect SuperAdmin accounts ──────────────────────────────────────────
    const target = await prisma.user.findUnique({
      where: { id },
      select: { isSuperAdmin: true },
    });
    if (target?.isSuperAdmin) {
      throw new AppError("SuperAdmin accounts cannot be modified.", 403);
    }
    // ────────────────────────────────────────────────────────────────────────

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, email: true },
    });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  } catch (error) {
    throw new AppError("Failed to update user status", 500);
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { subscriptionPlan, subscriptionStatus } = req.body;

    const data: any = {};
    if (subscriptionPlan) data.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus) data.subscriptionStatus = subscriptionStatus;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        email: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "User subscription updated",
      data: user,
    });
  } catch (error) {
    throw new AppError("Failed to update subscription", 500);
  }
};

// ─── Stores ────────────────────────────────────────────────────────────────────

export const getAllStores = async (req: Request, res: Response) => {
  try {
    // Fetch all stores along with their owner user info
    const stores = await prisma.store.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            subscriptionPlan: true,
            isSuperAdmin: true,
          },
          where: { isSuperAdmin: false },
          take: 1,
        },
        _count: {
          select: { products: true, transactions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = stores.map((store) => {
      const owner = store.users[0] ?? null;
      return {
        id: store.id,
        name: store.name,
        businessType: store.businessType,
        createdAt: store.createdAt,
        ownerName: owner?.name ?? null,
        ownerEmail: owner?.email ?? null,
        ownerStatus: owner?.status ?? "ACTIVE",
        ownerId: owner?.id ?? null,
        productCount: store._count.products,
        transactionCount: store._count.transactions,
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    throw new AppError("Failed to fetch stores", 500);
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Unlink users from store first
    await prisma.user.updateMany({
      where: { storeId: id },
      data: { storeId: null },
    });

    await prisma.store.delete({ where: { id } });

    res
      .status(200)
      .json({ success: true, message: "Store deleted successfully" });
  } catch (error) {
    throw new AppError("Failed to delete store", 500);
  }
};
