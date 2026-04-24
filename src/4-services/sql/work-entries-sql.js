import sqlService from "../sql-service.js";

export const listWorkEntriesForEmployee = (...args) => sqlService.listWorkEntriesForEmployee(...args);
export const getProjectById = (...args) => sqlService.getProjectById(...args);
export const createWorkEntry = (...args) => sqlService.createWorkEntry(...args);
export const getWorkEntryById = (...args) => sqlService.getWorkEntryById(...args);
export const updateWorkEntry = (...args) => sqlService.updateWorkEntry(...args);
export const deleteWorkEntry = (...args) => sqlService.deleteWorkEntry(...args);

export default {
  listWorkEntriesForEmployee,
  getProjectById,
  createWorkEntry,
  getWorkEntryById,
  updateWorkEntry,
  deleteWorkEntry,
};
