import { Router } from "express";
import { HrController } from "./hr.controller.js";

const router = Router();

router.get("/employees", HrController.getAllEmployees);
router.post("/employees", HrController.createEmployee);
router.post("/employees/attendance", HrController.markAttendance);
router.post("/employees/salary", HrController.paySalary);

export const hrRoutes = router;
