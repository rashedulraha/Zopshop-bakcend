import { prisma } from "../../lib/prisma.js";
import { TransactionService } from "../transaction/transaction.service.js";
import type { AttendanceStatus } from "../../generated/prisma/client.js";
import {
  TransactionType,
  TransactionMode,
} from "../../shared/utils/constants.js";

export const HrService = {
  async getAllEmployees(storeId: string) {
    return prisma.employee.findMany({
      where: { storeId },
      orderBy: { name: "asc" },
      include: {
        attendance: {
          take: 5,
          orderBy: { date: "desc" },
        },
      },
    });
  },

  async createEmployee(data: any, storeId: string) {
    return prisma.employee.create({
      data: {
        ...data,
        storeId,
      },
    });
  },

  async markAttendance(
    employeeId: string,
    date: string,
    status: AttendanceStatus,
    note?: string,
  ) {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    return prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate,
        },
      },
      update: {
        status,
        note: note || null,
      },
      create: {
        employeeId,
        date: attendanceDate,
        status,
        note: note || null,
      },
    });
  },

  async paySalary(
    employeeId: string,
    amount: number,
    mode: string,
    storeId: string,
    userId?: string,
    note?: string,
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, storeId },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const transactionNote = note || `Salary payment for ${employee.name}`;

    return TransactionService.createTransaction(
      {
        type: TransactionType.EXPENSE,
        mode: mode as any,
        amount,
        note: transactionNote,
        customData: {
          expenseCategory: "Salary",
          employeeId: employee.id,
        },
      },
      storeId,
      userId,
    );
  },
};
