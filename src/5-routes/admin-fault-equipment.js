import express from "express";
import { requireAdmin, requireAuth } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";
import * as faultEquipmentService from "../4-services/fault-equipment-service.js";
import { sendResult } from "./send-result.js";

const router = express.Router();

router.get("/admin/fault/manufacturers", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.listFaultManufacturers())));
router.post("/admin/fault/manufacturers", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.createFaultManufacturer(req.body))));
router.put("/admin/fault/manufacturers/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.updateFaultManufacturer(req.params.id, req.body))));
router.delete("/admin/fault/manufacturers/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.disableFaultManufacturer(req.params.id))));
router.get("/admin/fault/categories", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.listFaultEquipmentCategories(req.query.manufacturer_id))));
router.post("/admin/fault/categories", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.createFaultEquipmentCategory(req.body))));
router.put("/admin/fault/categories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.updateFaultEquipmentCategory(req.params.id, req.body))));
router.delete("/admin/fault/categories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.disableFaultEquipmentCategory(req.params.id))));
router.get("/admin/fault/subcategories", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.listFaultEquipmentSubcategories(req.query.equipment_category_id))));
router.post("/admin/fault/subcategories", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.createFaultEquipmentSubcategory(req.body))));
router.put("/admin/fault/subcategories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.updateFaultEquipmentSubcategory(req.params.id, req.body))));
router.delete("/admin/fault/subcategories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => sendResult(res, await faultEquipmentService.disableFaultEquipmentSubcategory(req.params.id))));

export default router;
