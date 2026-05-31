const API_BASE = import.meta.env.VITE_API_URL as string;

function authHeaders(accessToken: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchProjects(accessToken: string) {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: authHeaders(accessToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load projects.');
  return data.projects;
}

export async function createProject(accessToken: string, name: string) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to create project.');
  return data.project;
}

export async function updateProject(
  accessToken: string,
  projectId: string,
  updates: { name?: string; currentCode?: string }
) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PUT',
    headers: authHeaders(accessToken),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update project.');
  return data.project;
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