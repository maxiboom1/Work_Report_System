import express from "express";
import { requireAdmin, requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as projectsService from "../4-services/projects-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/admin/projects", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await projectsService.listProjects())));
router.post("/admin/projects", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await projectsService.createProject(req.body?.name))));
router.put("/admin/projects/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await projectsService.updateProject(req.params.id, req.body))));
router.delete("/admin/projects/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await projectsService.deleteProject(req.params.id))));

export default router;
