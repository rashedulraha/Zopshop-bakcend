import { prisma } from "../../lib/prisma.js";

export const FinanceService = {
  async getAccounts(storeId: string) {
    return prisma.bankAccount.findMany({
      where: { storeId },
      orderBy: { name: "asc" }
    });
  },

  async createAccount(data: any, storeId: string) {
    return prisma.bankAccount.create({
      data: {
        ...data,
        storeId,
      },
    });
  },

  async getIncome(storeId: string, from?: string, to?: string) {
    const where: any = { storeId };
    
    // Income includes SALES and PAYMENT_RECEIVED
    // Note: Net income from SALES is usually just the sale amount, but PAYMENT_RECEIVED 
    // is actual cash flow. Depending on accounting method (cash vs accrual), we use SALE for accrual,
    // and PAYMENT_RECEIVED for cash. We'll return both or a summary.
    where.type = { in: ["SALE", "PAYMENT_RECEIVED"] };
    
    if (from || to) {
      where.transactionDate = {};
      if (from) where.transactionDate.gte = new Date(from);
      if (to) where.transactionDate.lte = new Date(to);
    }

    return prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: "desc" }
    });
  },

  async getExpense(storeId: string, from?: string, to?: string) {
    const where: any = { storeId, type: "EXPENSE" };
    
    if (from || to) {
      where.transactionDate = {};
      if (from) where.transactionDate.gte = new Date(from);
      if (to) where.transactionDate.lte = new Date(to);
    }

    return prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: "desc" }
    });
  },

  async getProfitLoss(storeId: string, from?: string, to?: string) {
    const where: any = { storeId };
    
    if (from || to) {
      where.transactionDate = {};
      if (from) where.transactionDate.gte = new Date(from);
      if (to) where.transactionDate.lte = new Date(to);
    }

    const aggregations = await prisma.transaction.groupBy({
      by: ["type"],
      where,
      _sum: { netAmount: true },
    });

    let totalSales = 0;
    let totalExpenses = 0;
    let totalPurchases = 0;

    for (const agg of aggregations) {
      const amount = agg._sum.netAmount || 0;
      switch (agg.type) {
        case "SALE":
          totalSales += amount;
          break;
        case "EXPENSE":
          totalExpenses += amount;
          break;
        case "PURCHASE":
          totalPurchases += amount;
          break;
      }
    }

    // Gross Profit = Total Sales - Cost of Goods Sold (Purchases - we simplify here)
    // Net Profit = Gross Profit - Total Expenses
    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      grossProfit,
      netProfit,
    };
  }
};
