import express from "express";
import { requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as managerService from "../4-services/manager-service.js";
import * as faultsService from "../4-services/faults-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/my/manager/car-list", requireAuth, asyncHandler(async (req, res) => sendResult(res, await managerService.listManagerCarEmployees(req.user))));
router.post("/my/manager/contractors", requireAuth, asyncHandler(async (req, res) => sendResult(res, await managerService.createManagerContractorEntry(req.user, req.body))));
router.post("/my/manager/faults", requireAuth, asyncHandler(async (req, res) => sendResult(res, await faultsService.createManagerFault(req.user, req.body))));

export default router;
