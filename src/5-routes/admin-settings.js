import express from "express";
import { requireAdmin, requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as settingsService from "../4-services/settings-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/admin/settings", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await settingsService.getSettings())));
router.put("/admin/settings", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await settingsService.updateSettings(req.body))));

export default router;
