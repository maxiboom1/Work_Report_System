import sqlService from "../sql-service.js";

export const getEmployeeByLogin = (...args) => sqlService.getEmployeeByLogin(...args);
export const listEmployees = (...args) => sqlService.listEmployees(...args);
export const getEmployeeById = (...args) => sqlService.getEmployeeById(...args);
export const createEmployee = (...args) => sqlService.createEmployee(...args);
export const updateEmployee = (...args) => sqlService.updateEmployee(...args);
export const deleteEmployee = (...args) => sqlService.deleteEmployee(...args);

export default {
  getEmployeeByLogin,
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
