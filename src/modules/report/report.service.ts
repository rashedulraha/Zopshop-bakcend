import { prisma } from "../../lib/prisma.js";
import { TransactionType } from "../../shared/utils/constants.js";
import type { PartyTypeEnum } from "../../shared/utils/constants.js";
import { PartyService } from "../party/party.service.js"; // Reuse existing balance calculation

export const ReportService = {
  async getDashboardStats(storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalParties,
      lowStockCount,
      recentTransactions,
      todayTransactions,
    ] = await Promise.all([
      prisma.product.count({ where: { storeId } }),
      prisma.party.count({ where: { storeId } }),
      prisma.product.count({ where: { storeId, stock: { lt: 10 } } }), // using 10 as default threshold
      prisma.transaction.findMany({
        where: { storeId },
        orderBy: { transactionDate: "desc" },
        take: 10,
        include: { party: { select: { name: true } } },
      }),
      prisma.transaction.findMany({
        where: { storeId, transactionDate: { gte: today } },
        select: { type: true, netAmount: true },
      }),
    ]);

    let todaySales = 0;
    let todayCollections = 0;
    let todayExpenses = 0;

    todayTransactions.forEach((tx) => {
      if (tx.type === "SALE") todaySales += tx.netAmount;
      if (tx.type === "PAYMENT_RECEIVED") todayCollections += tx.netAmount;
      if (tx.type === "EXPENSE" || tx.type === "PAYMENT_SENT")
        todayExpenses += tx.netAmount;
    });

    const todayNetProfit = todaySales - todayExpenses;

    // Calculate total outstanding from parties
    // Since outstanding is tracked dynamically, we can sum the dueAmount for all CREDIT transactions where dueAmount > 0
    // Actually, net outstanding is sum of all party balances.
    // For simplicity as requested: "Sum of dueAmount for all CREDIT transactions"
    const outstandingAgg = await prisma.transaction.aggregate({
      where: { storeId, mode: "CREDIT" },
      _sum: { dueAmount: true },
    });

    return {
      totalProducts,
      totalParties,
      todaySales,
      todayCollections,
      todayExpenses,
      todayNetProfit,
      totalOutstanding: outstandingAgg._sum.dueAmount || 0,
      lowStockCount,
      recentTransactions,
    };
  },

  async getDailyReport(storeId: string, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        storeId,
        transactionDate: { gte: date, lt: nextDay },
      },
      include: { party: { select: { name: true } } },
      orderBy: { transactionDate: "asc" },
    });

    let totalSales = 0;
    let totalPurchases = 0;
    let totalExpenses = 0;
    let paymentsReceived = 0;
    let paymentsSent = 0;

    transactions.forEach((tx) => {
      switch (tx.type) {
        case "SALE":
          totalSales += tx.netAmount;
          break;
        case "PURCHASE":
          totalPurchases += tx.netAmount;
          break;
        case "EXPENSE":
          totalExpenses += tx.netAmount;
          break;
        case "PAYMENT_RECEIVED":
          paymentsReceived += tx.netAmount;
          break;
        case "PAYMENT_SENT":
          paymentsSent += tx.netAmount;
          break;
      }
    });

    const netCashFlow =
      totalSales +
      paymentsReceived -
      (totalPurchases + totalExpenses + paymentsSent);

    return {
      date: date.toISOString().split("T")[0],
      totalSales,
      totalPurchases,
      totalExpenses,
      paymentsReceived,
      paymentsSent,
      netCashFlow,
      transactions,
    };
  },

  async getOutstandingReport(storeId: string, type?: PartyTypeEnum) {
    const where: any = { storeId };
    if (type) where.type = type;

    const parties = await prisma.party.findMany({ where });
    const outstandingParties = [];

    // Optimize: fetch exact balance per party (since we don't store it)
    for (const party of parties) {
      const balance = await PartyService.getPartyBalance(party.id, storeId);

      // If balance is positive, customer owes us. If negative, we owe them.
      // The prompt says "parties with dueAmount > 0" or "parties who owe us / we owe".
      if (balance !== 0) {
        outstandingParties.push({
          id: party.id,
          name: party.name,
          mobile: party.mobile,
          type: party.type,
          totalDue: Math.abs(balance),
          status: balance > 0 ? "OWES_US" : "WE_OWE",
        });
      }
    }

    // Optionally sort by totalDue
    outstandingParties.sort((a, b) => b.totalDue - a.totalDue);

    return outstandingParties;
  },

  async getStockReport(
    storeId: string,
    lowStock?: string,
    thresholdStr?: string,
  ) {
    const threshold = thresholdStr ? parseInt(thresholdStr, 10) : 10;

    const where: any = { storeId };
    if (lowStock === "true") {
      where.stock = { lt: threshold };
    }

    return await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: { select: { name: true } },
        stock: true,
        unit: true,
        price: true,
      },
      orderBy: { stock: "asc" },
    });
  },

  async getProfitLossReport(storeId: string, from?: string, to?: string) {
    const where: any = { storeId };
    if (from || to) {
      where.transactionDate = {};
      if (from) where.transactionDate.gte = new Date(from);
      if (to) where.transactionDate.lte = new Date(to);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        items: {
          include: { product: { select: { purchasePrice: true } } },
        },
      },
    });

    let revenue = 0;
    let expenses = 0;
    let cogs = 0;

    transactions.forEach((tx) => {
      if (tx.type === "SALE" || tx.type === "PAYMENT_RECEIVED") {
        revenue += tx.netAmount;
      }
      if (
        tx.type === "PURCHASE" ||
        tx.type === "EXPENSE" ||
        tx.type === "PAYMENT_SENT"
      ) {
        expenses += tx.netAmount;
      }

      if (tx.type === "SALE") {
        tx.items.forEach((item) => {
          // If purchasePrice is null, default to 0
          const pp = item.product.purchasePrice || 0;
          cogs += item.quantity * pp;
        });
      }
    });

    const grossProfit = revenue - cogs;
    const netProfit = revenue - expenses;

    return {
      revenue,
      expenses,
      cogs,
      grossProfit,
      netProfit,
    };
  },

  async getPartyLedger(
    storeId: string,
    partyId: string,
    from?: string,
    to?: string,
  ) {
    const party = await prisma.party.findFirst({
      where: { id: partyId, storeId },
      select: { id: true, name: true, openingBalance: true },
    });

    if (!party) throw new Error("Party not found");

    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    // If 'from' date is provided, we need the running balance up to that date first
    let runningBalance = party.openingBalance;

    if (from) {
      const priorTransactions = await prisma.transaction.findMany({
        where: { storeId, partyId, transactionDate: { lt: new Date(from) } },
        select: { type: true, dueAmount: true, netAmount: true },
      });

      priorTransactions.forEach((tx) => {
        // According to our party balance logic:
        const amount =
          tx.type === "PAYMENT_RECEIVED" || tx.type === "PAYMENT_SENT"
            ? tx.netAmount
            : tx.dueAmount;
        if (tx.type === "SALE" || tx.type === "PAYMENT_SENT")
          runningBalance += amount;
        else if (tx.type === "PURCHASE" || tx.type === "PAYMENT_RECEIVED")
          runningBalance -= amount;
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        storeId,
        partyId,
        ...(Object.keys(dateFilter).length > 0
          ? { transactionDate: dateFilter }
          : {}),
      },
      orderBy: { transactionDate: "asc" },
    });

    const ledger = transactions.map((tx) => {
      const amount =
        tx.type === "PAYMENT_RECEIVED" || tx.type === "PAYMENT_SENT"
          ? tx.netAmount
          : tx.dueAmount;
      if (tx.type === "SALE" || tx.type === "PAYMENT_SENT")
        runningBalance += amount;
      else if (tx.type === "PURCHASE" || tx.type === "PAYMENT_RECEIVED")
        runningBalance -= amount;

      return {
        id: tx.id,
        date: tx.transactionDate,
        type: tx.type,
        amount: tx.netAmount,
        due: tx.dueAmount,
        running_balance: runningBalance,
      };
    });

    return {
      party: { id: party.id, name: party.name },
      openingBalance: party.openingBalance,
      closingBalance: runningBalance,
      ledger,
    };
  },

  async getSalesReport(
    storeId: string,
    from?: string,
    to?: string,
    groupBy: "day" | "week" | "month" = "day",
  ) {
    const where: any = { storeId, type: "SALE" };
    if (from || to) {
      where.transactionDate = {};
      if (from) where.transactionDate.gte = new Date(from);
      if (to) where.transactionDate.lte = new Date(to);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        transactionDate: true,
        netAmount: true,
        items: { select: { quantity: true } },
      },
      orderBy: { transactionDate: "asc" },
    });

    const groupedData: Record<
      string,
      {
        period: string;
        totalSales: number;
        totalItems: number;
        orderCount: number;
      }
    > = {};

    transactions.forEach((tx) => {
      const date = tx.transactionDate;
      if (!date) return;
      let periodKey = "";

      if (groupBy === "day") {
        periodKey = date.toISOString().split("T")[0]!;
      } else if (groupBy === "month") {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else if (groupBy === "week") {
        // ISO Week logic roughly
        const d = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
        );
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(
          ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
        );
        periodKey = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {
          period: periodKey,
          totalSales: 0,
          totalItems: 0,
          orderCount: 0,
        };
      }

      groupedData[periodKey]!.totalSales += tx.netAmount;
      groupedData[periodKey]!.orderCount += 1;

      const itemsCount = tx.items.reduce((sum, item) => sum + item.quantity, 0);
      groupedData[periodKey]!.totalItems += itemsCount;
    });

    const result = Object.values(groupedData).map((group) => ({
      ...group,
      averageOrderValue: group.totalSales / group.orderCount,
    }));

    return result;
  },
};
