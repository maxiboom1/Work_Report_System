import sqlService from "../sql-service.js";

export const listWorkEntriesForEmployee = (...args) => sqlService.listWorkEntriesForEmployee(...args);
export const getActiveWorkSessionForEmployee = (...args) => sqlService.getActiveWorkSessionForEmployee(...args);
export const getProjectById = (...args) => sqlService.getProjectById(...args);
export const createActiveWorkSession = (...args) => sqlService.createActiveWorkSession(...args);
export const completeActiveWorkSession = (...args) => sqlService.completeActiveWorkSession(...args);
export const deleteActiveWorkSessionForEmployee = (...args) => sqlService.deleteActiveWorkSessionForEmployee(...args);
export const createWorkEntry = (...args) => sqlService.createWorkEntry(...args);
export const getWorkEntryById = (...args) => sqlService.getWorkEntryById(...args);
export const findOverlappingWorkEntry = (...args) => sqlService.findOverlappingWorkEntry(...args);
export const findWorkEntryContainingTime = (...args) => sqlService.findWorkEntryContainingTime(...args);
export const findLatestNonZeroWorkEntryForDate = (...args) => sqlService.findLatestNonZeroWorkEntryForDate(...args);
export const updateWorkEntry = (...args) => sqlService.updateWorkEntry(...args);
export const deleteWorkEntry = (...args) => sqlService.deleteWorkEntry(...args);

export default {
  listWorkEntriesForEmployee,
  getActiveWorkSessionForEmployee,
  getProjectById,
  createActiveWorkSession,
  completeActiveWorkSession,
  deleteActiveWorkSessionForEmployee,
  createWorkEntry,
  getWorkEntryById,
  findOverlappingWorkEntry,
  findWorkEntryContainingTime,
  findLatestNonZeroWorkEntryForDate,
  updateWorkEntry,
  deleteWorkEntry,
};
