import sqlService from "../sql-service.js";

export const employeeMonthlyReport = (...args) => sqlService.employeeMonthlyReport(...args);
export const projectReport = (...args) => sqlService.projectReport(...args);
export const contractorMonthlyReport = (...args) => sqlService.contractorMonthlyReport(...args);
export const updateContractorServiceCost = (...args) => sqlService.updateContractorServiceCost(...args);

export default {
  employeeMonthlyReport,
  projectReport,
  contractorMonthlyReport,
  updateContractorServiceCost,
};
