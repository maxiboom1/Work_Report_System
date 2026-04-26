import express from "express";
import { requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as profileService from "../4-services/profile-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/my/profile", requireAuth, asyncHandler(async (req, res) => {
  return sendResult(res, await profileService.getMyProfile(req.user));
}));

router.put("/my/profile", requireAuth, asyncHandler(async (req, res) => {
  return sendResult(res, await profileService.updateMyProfile(req.user, req.body));
}));

export default router;
