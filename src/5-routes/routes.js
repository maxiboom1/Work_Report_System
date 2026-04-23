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

export default router;
