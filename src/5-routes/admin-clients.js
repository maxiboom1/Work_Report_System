import express from "express";
import { requireAdmin, requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as clientsService from "../4-services/clients-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/admin/clients", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.listClients())));
router.post("/admin/clients", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.createClient(req.body))));
router.put("/admin/clients/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.updateClient(req.params.id, req.body))));
router.delete("/admin/clients/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.disableClient(req.params.id))));
router.get("/admin/client-sites", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.listClientSites(req.query.client_id))));
router.post("/admin/client-sites", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.createClientSite(req.body))));
router.put("/admin/client-sites/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.updateClientSite(req.params.id, req.body))));
router.delete("/admin/client-sites/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.disableClientSite(req.params.id))));
router.get("/admin/client-contacts", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.listClientContacts(req.query.client_id))));
router.post("/admin/client-contacts", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.createClientContact(req.body))));
router.put("/admin/client-contacts/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.updateClientContact(req.params.id, req.body))));
router.delete("/admin/client-contacts/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await clientsService.disableClientContact(req.params.id))));

export default router;
