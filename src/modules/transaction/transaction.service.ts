import { prisma } from "../../lib/prisma.js";
import {
  generateInvoiceNo,
  calculateNetAmount,
} from "../../shared/utils/helpers.js";
import type {
  TransactionTypeEnum,
  TransactionModeEnum,
} from "../../shared/utils/constants.js";

interface TransactionItemDTO {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateTransactionDTO {
  partyId?: string;
  type: TransactionTypeEnum;
  mode: TransactionModeEnum;
  amount: number;
  discount?: number;
  tax?: number;
  paidAmount?: number;
  note?: string;
  transactionDate?: string;
  customData?: Record<string, any>;
  items?: TransactionItemDTO[];
}

interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {}

interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionTypeEnum;
  mode?: TransactionModeEnum;
  partyId?: string;
  from?: string;
  to?: string;
}

export const TransactionService = {
  async createTransaction(
    data: CreateTransactionDTO,
    storeId: string,
    userId?: string,
  ) {
    const {
      partyId,
      type,
      mode,
      amount,
      discount = 0,
      tax = 0,
      paidAmount = 0,
      note,
      transactionDate,
      customData,
      items = [],
    } = data;

    const netAmount = calculateNetAmount(amount, discount, tax);
    const dueAmount = netAmount - paidAmount;
    const invoiceNo = generateInvoiceNo(type.substring(0, 3));
    const date = transactionDate ? new Date(transactionDate) : new Date();

    return await prisma.$transaction(async (tx) => {
      // 1. Create Transaction and Items
      const transaction = await tx.transaction.create({
        data: {
          invoiceNo,
          storeId,
          partyId: partyId || null,
          type,
          mode,
          amount,
          discount,
          tax,
          netAmount,
          paidAmount,
          dueAmount,
          note: note || null,
          transactionDate: date,
          customData: customData || {},
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              netPrice: item.quantity * item.unitPrice, // Simplified for now, can apply item-level discounts later
            })),
          },
        },
        include: {
          items: true,
          party: { select: { id: true, name: true } },
        },
      });

      // 2. Handle Stock Updates for SALE, PURCHASE, and RETURNS
      if (["SALE", "PURCHASE", "SALE_RETURN", "PURCHASE_RETURN"].includes(type)) {
        for (const item of items) {
          let operation = "increment";
          if (type === "SALE" || type === "PURCHASE_RETURN") {
            operation = "decrement";
          } else if (type === "PURCHASE" || type === "SALE_RETURN") {
            operation = "increment";
          }
          
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { [operation]: item.quantity } },
          });
        }
      }

      // Note: Party Balance is strictly calculated dynamically via aggregations,
      // so we do NOT explicitly update party.openingBalance here to avoid double counting.

      return transaction;
    });
  },

  async getAllTransactions(storeId: string, filters: TransactionFilters) {
    const { page = 1, limit = 10, type, mode, partyId, from, to } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { storeId };

    if (type) where.type = type;
    if (mode) where.mode = mode;
    if (partyId) where.partyId = partyId;
    if (from || to) {
      where.transactionDate = {};
      if (from) where.transactionDate.gte = new Date(from);
      if (to) where.transactionDate.lte = new Date(to);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        include: {
          party: { select: { id: true, name: true } },
        },
        orderBy: { transactionDate: "desc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    };
  },

  async getTransactionById(id: string, storeId: string) {
    return await prisma.transaction.findFirst({
      where: { id, storeId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, unit: true } },
          },
        },
        party: { select: { id: true, name: true } },
      },
    });
  },

  async updateTransaction(
    id: string,
    storeId: string,
    data: UpdateTransactionDTO,
  ) {
    // Note: A full update handles replacing items. It reverses the old transaction's stock effects,
    // deletes old items, and applies new effects and new items.
    return await prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, storeId },
        include: { items: true },
      });

      if (!oldTx) throw new Error("Transaction not found");

      // 1. Reverse old stock effects
      if (["SALE", "PURCHASE", "SALE_RETURN", "PURCHASE_RETURN"].includes(oldTx.type)) {
        for (const item of oldTx.items) {
          let operation = "decrement"; // Reverse of increment
          if (oldTx.type === "SALE" || oldTx.type === "PURCHASE_RETURN") {
            operation = "increment"; // Reverse of decrement
          } else if (oldTx.type === "PURCHASE" || oldTx.type === "SALE_RETURN") {
            operation = "decrement"; // Reverse of increment
          }
          
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { [operation]: item.quantity } },
          });
        }
      }

      // 2. Delete old items
      await tx.transactionItem.deleteMany({
        where: { transactionId: id },
      });

      // 3. Prepare new data
      const type = data.type || (oldTx.type as TransactionTypeEnum);
      const amount = data.amount ?? oldTx.amount;
      const discount = data.discount ?? oldTx.discount;
      const tax = data.tax ?? oldTx.tax;
      const paidAmount = data.paidAmount ?? oldTx.paidAmount;

      const netAmount = calculateNetAmount(amount, discount, tax);
      const dueAmount = netAmount - paidAmount;

      const items = data.items || [];

      // 4. Update transaction with new items
      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          partyId:
            data.partyId !== undefined ? data.partyId || null : oldTx.partyId,
          type,
          mode: data.mode || oldTx.mode,
          amount,
          discount,
          tax,
          netAmount,
          paidAmount,
          dueAmount,
          note: data.note !== undefined ? data.note || null : oldTx.note,
          transactionDate: data.transactionDate
            ? new Date(data.transactionDate)
            : oldTx.transactionDate,
          customData: (data.customData !== undefined
            ? data.customData
            : oldTx.customData) as any,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              netPrice: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
          party: { select: { id: true, name: true } },
        },
      });

      // 5. Apply new stock effects
      if (["SALE", "PURCHASE", "SALE_RETURN", "PURCHASE_RETURN"].includes(type)) {
        for (const item of items) {
          let operation = "increment";
          if (type === "SALE" || type === "PURCHASE_RETURN") {
            operation = "decrement";
          } else if (type === "PURCHASE" || type === "SALE_RETURN") {
            operation = "increment";
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { [operation]: item.quantity } },
          });
        }
      }

      return updatedTx;
    });
  },

  async deleteTransaction(id: string, storeId: string) {
    return await prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, storeId },
        include: { items: true },
      });

      if (!oldTx) return false;

      // Reverse stock effects
      if (["SALE", "PURCHASE", "SALE_RETURN", "PURCHASE_RETURN"].includes(oldTx.type)) {
        for (const item of oldTx.items) {
          let operation = "decrement"; // Reverse of increment
          if (oldTx.type === "SALE" || oldTx.type === "PURCHASE_RETURN") {
            operation = "increment"; // Reverse of decrement
          } else if (oldTx.type === "PURCHASE" || oldTx.type === "SALE_RETURN") {
            operation = "decrement"; // Reverse of increment
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { [operation]: item.quantity } },
          });
        }
      }

      // Delete items and transaction (assuming Cascade is on or doing it manually)
      // We'll do it manually to be safe if cascade isn't configured, but schema has onDelete: Cascade
      await tx.transaction.delete({
        where: { id },
      });

      return true;
    });
  },

  async getDailySummary(storeId: string, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        storeId,
        transactionDate: {
          gte: date,
          lt: nextDay,
        },
      },
      select: {
        type: true,
        netAmount: true,
        paidAmount: true,
      },
    });

    const summary = {
      totalSales: 0,
      totalPurchases: 0,
      totalExpenses: 0,
      totalPaymentsReceived: 0,
      totalPaymentsSent: 0,
    };

    for (const tx of transactions) {
      switch (tx.type) {
        case "SALE":
          summary.totalSales += tx.netAmount;
          break;
        case "PURCHASE":
          summary.totalPurchases += tx.netAmount;
          break;
        case "EXPENSE":
          summary.totalExpenses += tx.netAmount;
          break;
        case "PAYMENT_RECEIVED":
          summary.totalPaymentsReceived += tx.netAmount; // Or paidAmount if mapped that way, but amount is stored as netAmount
          break;
        case "PAYMENT_SENT":
          summary.totalPaymentsSent += tx.netAmount;
          break;
      }
    }

    return {
      date: date.toISOString().split("T")[0],
      summary,
    };
  },
};
