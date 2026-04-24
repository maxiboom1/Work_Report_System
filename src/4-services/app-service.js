import * as settingsService from "./settings-service.js";
import * as employeesService from "./employees-service.js";
import * as managerService from "./manager-service.js";
import * as projectsService from "./projects-service.js";
import * as clientsService from "./clients-service.js";
import * as faultEquipmentService from "./fault-equipment-service.js";
import * as workEntriesService from "./work-entries-service.js";
import * as reportsService from "./reports-service.js";

export default {
  ...settingsService,
  ...employeesService,
  ...managerService,
  ...projectsService,
  ...clientsService,
  ...faultEquipmentService,
  ...workEntriesService,
  ...reportsService,
};
