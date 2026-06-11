import type { Project } from "../components/ProjectCard";

const API_BASE = import.meta.env.VITE_API_URL as string;

function authHeaders(accessToken: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

function mapDBProjectToFrontend(dbProj: any): Project {
  return {
    id: dbProj.id,
    name: dbProj.name,
    description: dbProj.current_code ? "AI generated code present" : "Empty project draft",
    status: dbProj.current_code ? "active" : "draft",
    createdAt: dbProj.created_at,
    updatedAt: dbProj.updated_at,
    currentCode: dbProj.current_code,
  };
}

export async function fetchProjects(accessToken: string): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: authHeaders(accessToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load projects.');
  return (data.projects || []).map(mapDBProjectToFrontend);
}

export async function createProject(accessToken: string, name: string, template?: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ name, template }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to create project.');
  return mapDBProjectToFrontend(data.project);
}

export async function updateProject(
  accessToken: string,
  projectId: string,
  updates: { name?: string; currentCode?: string }
): Promise<Project> {
  const body: any = {};
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.currentCode !== undefined) body.currentCode = updates.currentCode;

  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PUT',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update project.');
  return mapDBProjectToFrontend(data.project);
}

export async function deleteProject(accessToken: string, projectId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to delete project.');
  return data;
}

export async function fetchProjectById(accessToken: string, projectId: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    headers: authHeaders(accessToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load project.');
  return mapDBProjectToFrontend(data.project);
}