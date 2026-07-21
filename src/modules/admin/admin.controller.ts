import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../shared/utils/appError.js";

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
