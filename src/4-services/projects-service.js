import sqlService from "./sql/projects-sql.js";
import { isNonEmptyString, toInt } from "./shared/validators.js";

export async function listProjectsForUser(user) {
    const role = String(user?.role || "employee").toLowerCase();
    if (role === "admin") {
      return listProjects();
    }
    const projects = await sqlService.listActiveProjects();
    return { ok: true, projects };
}

export async function listProjects() {
    const projects = await sqlService.listProjects();
    return { ok: true, projects };
}

export async function createProject(name) {
    const n = String(name || "").trim();
    if (!n) return { ok: false, status: 400, message: "Missing project name" };
    const id = await sqlService.createProject(n);
    if (!id) return { ok: false, status: 500, message: "Failed to create project" };
    return { ok: true, id, message: "Project created" };
}

export async function updateProject(id, patch) {
    const projectId = toInt(id);
    if (!projectId) return { ok: false, status: 400, message: "Invalid project id" };
    const p = {};
    if (patch?.name !== undefined) p.name = String(patch.name || "").trim();
    if (patch?.is_active !== undefined) p.is_active = patch.is_active ? 1 : 0;
    const affected = await sqlService.updateProject(projectId, p);
    if (!affected) return { ok: false, status: 404, message: "Project not found" };
    return { ok: true, message: "Project updated" };
}

export async function deleteProject(id) {
    const projectId = toInt(id);
    if (!projectId) return { ok: false, status: 400, message: "Invalid project id" };
    const affected = await sqlService.deleteProject(projectId);
    if (!affected) return { ok: false, status: 404, message: "Project not found" };
    return { ok: true, message: "Project deleted" };
  }
