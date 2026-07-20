import { prisma } from "../../lib/prisma.js";
import { generateInvoiceNo, calculateNetAmount } from "../../shared/utils/helpers.js";
import type { TransactionTypeEnum, TransactionModeEnum } from "../../shared/utils/constants.js";

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
  async createTransaction(data: CreateTransactionDTO, storeId: string, userId?: string) {
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

      // 2. Handle Stock Updates for SALE and PURCHASE
      if (type === "SALE" || type === "PURCHASE") {
        for (const item of items) {
          const operation = type === "SALE" ? "decrement" : "increment";
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
};
