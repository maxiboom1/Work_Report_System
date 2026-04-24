import express from "express";
import { requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as clientsService from "../4-services/clients-service.js";
import * as faultEquipmentService from "../4-services/fault-equipment-service.js";
import * as projectsService from "../4-services/projects-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/projects", requireAuth, asyncHandler(async (req, res) => {
  return sendResult(res, await projectsService.listProjectsForUser(req.user));
}));

router.get("/fault/equipment-tree", requireAuth, asyncHandler(async (req, res) => {
  return sendResult(res, await faultEquipmentService.getFaultEquipmentTree());
}));

router.get("/fault/client-tree", requireAuth, asyncHandler(async (req, res) => {
  return sendResult(res, await clientsService.getClientContactTree());
}));

export default router;
