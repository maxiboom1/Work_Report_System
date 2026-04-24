import sqlService from "../sql-service.js";

export const listProjects = (...args) => sqlService.listProjects(...args);
export const listActiveProjects = (...args) => sqlService.listActiveProjects(...args);
export const getProjectById = (...args) => sqlService.getProjectById(...args);
export const createProject = (...args) => sqlService.createProject(...args);
export const updateProject = (...args) => sqlService.updateProject(...args);
export const deleteProject = (...args) => sqlService.deleteProject(...args);

export default {
  listProjects,
  listActiveProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
