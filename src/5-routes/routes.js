import express from "express";
import authRoutes from "./auth.js";
import adminClientsRoutes from "./admin-clients.js";
import adminEmployeesRoutes from "./admin-employees.js";
import adminFaultsRoutes from "./admin-faults.js";
import adminFaultEquipmentRoutes from "./admin-fault-equipment.js";
import adminProjectsRoutes from "./admin-projects.js";
import adminReportsRoutes from "./admin-reports.js";
import adminSettingsRoutes from "./admin-settings.js";
import managerToolsRoutes from "./manager-tools.js";
import myProfileRoutes from "./my-profile.js";
import myWorkEntriesRoutes from "./my-work-entries.js";
import myWorkSessionRoutes from "./my-work-session.js";
import publicLookupsRoutes from "./public-lookups.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use(publicLookupsRoutes);
router.use(myProfileRoutes);
router.use(myWorkSessionRoutes);
router.use(myWorkEntriesRoutes);
router.use(managerToolsRoutes);
router.use(adminSettingsRoutes);
router.use(adminEmployeesRoutes);
router.use(adminFaultsRoutes);
router.use(adminProjectsRoutes);
router.use(adminClientsRoutes);
router.use(adminFaultEquipmentRoutes);
router.use(adminReportsRoutes);

export default router;
