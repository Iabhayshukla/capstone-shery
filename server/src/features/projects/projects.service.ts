import { supabaseAdmin } from '../../lib/supabase';
import { createError } from '../../middleware/errorHandler';
import {
  CreateProjectBody,
  UpdateProjectBody,
  Project,
  ConversationMessage,
  AddConversationBody,
} from './projects.types';
import { PORTFOLIO_TEMPLATE, LANDING_TEMPLATE } from './templates';

export async function getUserProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[projects.service] getUserProjects error:', error);
    throw createError('Failed to load projects. Please try again.', 500);
  }

  return (data ?? []) as Project[];
}

export async function createProject(userId: string, body: CreateProjectBody): Promise<Project> {
  let initialCode = null;
  if (body.template === 'portfolio') {
    initialCode = PORTFOLIO_TEMPLATE;
  } else if (body.template === 'landing') {
    initialCode = LANDING_TEMPLATE;
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      user_id: userId,
      name: body.name.trim(),
      current_code: initialCode,
    })
    .select()
    .single();

  if (error) {
    console.error('[projects.service] createProject error:', error);
    throw createError('Failed to create project. Please try again.', 500);
  }

  return data as Project;
}

export async function updateProject(
  userId: string,
  projectId: string,
  body: UpdateProjectBody
): Promise<Project> {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .single();

  if (fetchError || !existing) {
    throw createError('Project not found.', 404);
  }
  if (existing.user_id !== userId) {
    throw createError('You do not have permission to edit this project.', 403);
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.currentCode !== undefined) updates.current_code = body.currentCode;

  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('[projects.service] updateProject error:', error);
    throw createError('Failed to update project. Please try again.', 500);
  }

  return data as Project;
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .single();

  if (fetchError || !existing) {
    throw createError('Project not found.', 404);
  }
  if (existing.user_id !== userId) {
    throw createError('You do not have permission to delete this project.', 403);
  }

  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('[projects.service] deleteProject error:', error);
    throw createError('Failed to delete project. Please try again.', 500);
  }
}

export async function getProjectById(userId: string, projectId: string): Promise<Project> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw createError('Project not found.', 404);
  }

  return data as Project;
}

// ─── Conversations ──────────────────────────────────────────────────────────

export async function getConversations(projectId: string): Promise<ConversationMessage[]> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw createError('Failed to load conversations.', 500);
  return (data ?? []) as ConversationMessage[];
}

export async function addConversationMessage(
  projectId: string,
  body: AddConversationBody
): Promise<ConversationMessage> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({
      project_id: projectId,
      role: body.role,
      content: body.content,
    })
    .select()
    .single();

  if (error) {
    console.error('[projects.service] addConversationMessage error:', error);
    throw createError('Failed to save message.', 500);
  }

  return data as ConversationMessage;
}