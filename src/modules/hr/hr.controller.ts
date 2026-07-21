import type { Request, Response, NextFunction } from "express";
import { HrService } from "./hr.service.js";
import type { ApiResponse } from "../../shared/types/index.js";

export const HrController = {
  async getAllEmployees(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const employees = await HrService.getAllEmployees(storeId);

      return res.status(200).json({
        success: true,
        message: "Employees fetched successfully",
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  },

  async createEmployee(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const { name, mobile } = req.body;

      if (!name || !mobile) {
        return res.status(400).json({ success: false, message: "Name and mobile are required" });
      }

      const employee = await HrService.createEmployee(req.body, storeId);

      return res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAttendance(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const { employeeId, date, status, note } = req.body;

      if (!employeeId || !date || !status) {
        return res.status(400).json({ success: false, message: "employeeId, date, and status are required" });
      }

      const attendance = await HrService.markAttendance(employeeId, date, status, note);

      return res.status(200).json({
        success: true,
        message: "Attendance marked successfully",
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  },

  async paySalary(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const storeId = req.storeId!;
      const userId = req.user?.id;
      const { employeeId, amount, mode, note } = req.body;

      if (!employeeId || !amount || !mode) {
        return res.status(400).json({ success: false, message: "employeeId, amount, and mode are required" });
      }

      const transaction = await HrService.paySalary(employeeId, Number(amount), mode, storeId, userId, note);

      return res.status(201).json({
        success: true,
        message: "Salary paid successfully",
        data: transaction,
      });
    } catch (error: any) {
      if (error.message === "Employee not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
};
