import express from "express";
import { requireAdmin, requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as reportsService from "../4-services/reports-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/admin/reports/employee/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await reportsService.getEmployeeMonthlyReport(req.params.id, String(req.query.month || "")))));
router.get("/admin/reports/project/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await reportsService.getProjectReport(req.params.id, String(req.query.month || "")))));
router.get("/admin/reports/contractors", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await reportsService.getContractorMonthlyReport(String(req.query.month || "")))));
router.put("/admin/contractors/:id/cost", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await reportsService.updateContractorServiceCost(req.params.id, req.body))));

export default router;
