export interface CreateProjectBody {
  name: string;
  template?: string;
}

export interface UpdateProjectBody {
  name?: string;
  currentCode?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  current_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  project_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AddConversationBody {
  role: 'user' | 'assistant';
  content: string;
}