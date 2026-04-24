import express from "express";
import { requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as workEntriesService from "../4-services/work-entries-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/my/work-entries", requireAuth, asyncHandler(async (req, res) => sendResult(res, await workEntriesService.listMyEntries(req.user, String(req.query.month || "")))));
router.post("/my/work-entries", requireAuth, asyncHandler(async (req, res) => sendResult(res, await workEntriesService.createMyEntry(req.user, req.body))));
router.put("/my/work-entries/:id", requireAuth, asyncHandler(async (req, res) => sendResult(res, await workEntriesService.updateMyEntry(req.user, req.params.id, req.body))));
router.delete("/my/work-entries/:id", requireAuth, asyncHandler(async (req, res) => sendResult(res, await workEntriesService.deleteMyEntry(req.user, req.params.id))));

export default router;
