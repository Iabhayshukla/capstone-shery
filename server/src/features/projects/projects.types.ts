export interface CreateProjectBody {
  name: string;
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