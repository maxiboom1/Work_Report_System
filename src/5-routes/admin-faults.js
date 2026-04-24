import express from "express";
import { requireAdmin, requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as faultsService from "../4-services/faults-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/admin/faults", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultsService.listAdminFaults(req.query))));
router.get("/admin/faults/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultsService.getAdminFaultDetail(req.params.id))));
router.put("/admin/faults/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultsService.updateAdminFault(req.params.id, req.body))));
router.put("/admin/faults/:id/status", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultsService.updateAdminFaultStatus(req.user, req.params.id, req.body))));
router.post("/admin/faults/:id/events", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultsService.addAdminFaultEvent(req.user, req.params.id, req.body))));

export default router;
