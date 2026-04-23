import express from "express";
import authRoutes from "./auth.js";
import appService from "../4-services/app-service.js";
import { requireAuth, requireAdmin } from "../2-middleware/auth-middleware.js";
import asyncHandler from "../3-utilities/async-handler.js";

const router = express.Router();

// Auth
router.use("/auth", authRoutes);

// =========================
// PUBLIC LOOKUPS (logged-in)
// =========================

router.get("/projects", requireAuth, asyncHandler(async (req, res) => {
  const result = await appService.listProjectsForUser(req.user);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.get("/fault/equipment-tree", requireAuth, asyncHandler(async (req, res) => {
  const result = await appService.getFaultEquipmentTree();
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.get("/fault/client-tree", requireAuth, asyncHandler(async (req, res) => {
  const result = await appService.getClientContactTree();
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

// =========================
// EMPLOYEE: Work Entries
// =========================

router.get("/my/work-entries", requireAuth, asyncHandler(async (req, res) => {
  const month = String(req.query.month || "");
  const result = await appService.listMyEntries(req.user, month);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/my/work-entries", requireAuth, asyncHandler(async (req, res) => {
  const result = await appService.createMyEntry(req.user, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/my/work-entries/:id", requireAuth, asyncHandler(async (req, res) => {
  const result = await appService.updateMyEntry(req.user, req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.delete("/my/work-entries/:id", requireAuth, asyncHandler(async (req, res) => {
  const result = await appService.deleteMyEntry(req.user, req.params.id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

// =========================
// EMPLOYEE: Manager tools
// =========================

router.get("/my/manager/car-list", requireAuth, asyncHandler(async (req, res) => {
  const result = await appService.listManagerCarEmployees(req.user);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/my/manager/contractors", requireAuth, asyncHandler(async (req, res) => {
  const result = await appService.createManagerContractorEntry(req.user, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

// =========================
// ADMIN: Settings
// =========================

router.get("/admin/settings", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.getSettings();
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/settings", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateSettings(req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

// =========================
// ADMIN: Employees CRUD
// =========================

router.get("/admin/employees", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.listEmployees();
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/admin/employees", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.createEmployee(req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/employees/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateEmployee(req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.delete("/admin/employees/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.deleteEmployee(req.params.id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

// =========================
// ADMIN: Projects CRUD
// =========================

router.get("/admin/projects", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.listProjects();
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/admin/projects", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.createProject(req.body?.name);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/projects/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateProject(req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.delete("/admin/projects/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.deleteProject(req.params.id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

// =========================
// ADMIN: Clients hierarchy
// =========================

router.get("/admin/clients", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.listClients();
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/admin/clients", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.createClient(req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/clients/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateClient(req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.delete("/admin/clients/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.disableClient(req.params.id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.get("/admin/client-sites", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.listClientSites(req.query.client_id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/admin/client-sites", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.createClientSite(req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/client-sites/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateClientSite(req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.delete("/admin/client-sites/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.disableClientSite(req.params.id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.get("/admin/client-contacts", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.listClientContacts(req.query.client_id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/admin/client-contacts", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.createClientContact(req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/client-contacts/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateClientContact(req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.delete("/admin/client-contacts/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.disableClientContact(req.params.id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

// =========================
// ADMIN: Fault equipment hierarchy
// =========================

router.get("/admin/fault/manufacturers", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.listFaultManufacturers();
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/admin/fault/manufacturers", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.createFaultManufacturer(req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/fault/manufacturers/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateFaultManufacturer(req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.delete("/admin/fault/manufacturers/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.disableFaultManufacturer(req.params.id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.get("/admin/fault/categories", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.listFaultEquipmentCategories(req.query.manufacturer_id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/admin/fault/categories", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.createFaultEquipmentCategory(req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/fault/categories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateFaultEquipmentCategory(req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.delete("/admin/fault/categories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.disableFaultEquipmentCategory(req.params.id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.get("/admin/fault/subcategories", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.listFaultEquipmentSubcategories(req.query.equipment_category_id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.post("/admin/fault/subcategories", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.createFaultEquipmentSubcategory(req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/fault/subcategories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateFaultEquipmentSubcategory(req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.delete("/admin/fault/subcategories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.disableFaultEquipmentSubcategory(req.params.id);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

// =========================
// ADMIN: Reports
// =========================

router.get("/admin/reports/employee/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const month = String(req.query.month || "");
  const result = await appService.getEmployeeMonthlyReport(req.params.id, month);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.get("/admin/reports/project/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const month = String(req.query.month || "");
  const result = await appService.getProjectReport(req.params.id, month);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.get("/admin/reports/contractors", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const month = String(req.query.month || "");
  const result = await appService.getContractorMonthlyReport(month);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

router.put("/admin/contractors/:id/cost", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await appService.updateContractorServiceCost(req.params.id, req.body);
  return res.status(result.ok ? 200 : (result.status || 500)).json(result);
}));

export default router;
