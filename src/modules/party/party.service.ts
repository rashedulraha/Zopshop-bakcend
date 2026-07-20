import { prisma } from "../../lib/prisma.js";
import type { PartyTypeEnum } from "../../shared/utils/constants.js";

interface CreatePartyDTO {
  name: string;
  mobile?: string;
  email?: string;
  address?: string;
  type: PartyTypeEnum;
  openingBalance?: number;
  customData?: Record<string, any>;
}

interface UpdatePartyDTO extends Partial<CreatePartyDTO> {}

interface PartyFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: PartyTypeEnum;
}

interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  from?: string;
  to?: string;
}

export const PartyService = {
  async createParty(data: CreatePartyDTO, storeId: string) {
    return await prisma.party.create({
      data: {
        ...data,
        storeId,
        openingBalance: data.openingBalance ?? 0,
      },
    });
  },

  async getAllParties(storeId: string, filters: PartyFilters) {
    const { page = 1, limit = 10, search, type } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { storeId };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } },
      ];
    }

    const [parties, total] = await Promise.all([
      prisma.party.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.party.count({ where }),
    ]);

    return {
      parties,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  },

  async getPartyById(id: string, storeId: string) {
    const party = await prisma.party.findFirst({
      where: { id, storeId },
    });

    if (!party) return null;

    // Attach balance for convenience when fetching single party
    const balance = await this.getPartyBalance(id, storeId);

    return {
      ...party,
      balance,
    };
  },

  async updateParty(id: string, storeId: string, data: UpdatePartyDTO) {
    const party = await prisma.party.findFirst({ where: { id, storeId } });

    if (!party) return null;

    return await prisma.party.update({
      where: { id },
      data,
    });
  },

  async deleteParty(id: string, storeId: string) {
    const party = await prisma.party.findFirst({
      where: { id, storeId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!party) {
      throw new Error("Party not found");
    }

    if (party._count.transactions > 0) {
      throw new Error("Cannot delete party because it has associated transactions");
    }

    await prisma.party.delete({
      where: { id },
    });

    return true;
  },

  async getPartyBalance(id: string, storeId: string) {
    const party = await prisma.party.findFirst({
      where: { id, storeId },
      select: { openingBalance: true },
    });

    if (!party) {
      throw new Error("Party not found");
    }

    // Prisma aggregations grouping by type to sum dueAmount
    const aggregations = await prisma.transaction.groupBy({
      by: ["type"],
      where: { partyId: id, storeId },
      _sum: {
        dueAmount: true,
      },
    });

    let balance = party.openingBalance;

    aggregations.forEach((agg) => {
      const sum = agg._sum.dueAmount || 0;
      switch (agg.type) {
        case "SALE":
        case "PAYMENT_SENT":
          balance += sum;
          break;
        case "PURCHASE":
        case "PAYMENT_RECEIVED":
          balance -= sum;
          break;
      }
    });

    return balance;
  },

  async getPartyTransactions(id: string, storeId: string, filters: TransactionFilters) {
    const { page = 1, limit = 10, type, from, to } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { partyId: id, storeId };

    if (type) {
      where.type = type;
    }

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
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  },
};
