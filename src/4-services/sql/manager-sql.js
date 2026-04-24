import sqlService from "../sql-service.js";

export const getEmployeeById = (...args) => sqlService.getEmployeeById(...args);
export const listEmployeesForManagerCarList = (...args) => sqlService.listEmployeesForManagerCarList(...args);
export const getProjectById = (...args) => sqlService.getProjectById(...args);
export const createContractorEntry = (...args) => sqlService.createContractorEntry(...args);

export default {
  getEmployeeById,
  listEmployeesForManagerCarList,
  getProjectById,
  createContractorEntry,
};
