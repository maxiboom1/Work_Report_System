import express from "express";
import { requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as workEntriesService from "../4-services/work-entries-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/my/work-session/active", requireAuth, asyncHandler(async (req, res) => sendResult(res, await workEntriesService.getActiveSession(req.user))));
router.post("/my/work-session/start", requireAuth, asyncHandler(async (req, res) => sendResult(res, await workEntriesService.startSession(req.user, req.body))));
router.post("/my/work-session/stop", requireAuth, asyncHandler(async (req, res) => sendResult(res, await workEntriesService.stopSession(req.user, req.body))));
router.post("/my/work-session/recover-close", requireAuth, asyncHandler(async (req, res) => sendResult(res, await workEntriesService.recoverCloseSession(req.user, req.body))));
router.post("/my/work-session/discard", requireAuth, asyncHandler(async (req, res) => sendResult(res, await workEntriesService.discardSession(req.user))));

export default router;
