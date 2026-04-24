import express from "express";
import { requireAdmin, requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as employeesService from "../4-services/employees-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/admin/employees", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await employeesService.listEmployees())));
router.post("/admin/employees", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await employeesService.createEmployee(req.body))));
router.put("/admin/employees/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await employeesService.updateEmployee(req.params.id, req.body))));
router.delete("/admin/employees/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await employeesService.deleteEmployee(req.params.id))));

export default router;
