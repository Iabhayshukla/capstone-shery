export interface GenerateRequestBody {
  prompt: string;
  projectId: string;
  sectionId?: string;
  currentHtml?: string;
  framework?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}