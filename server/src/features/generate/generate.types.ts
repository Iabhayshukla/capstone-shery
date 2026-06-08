export interface GenerateRequestBody {
  prompt: string;
  projectId: string;
  sectionId?: string | null;
  currentHtml?: string | null;
  framework?: string;        // e.g. "React + Vite", "HTML + CSS + JS"
  previewMethod?: 'iframe' | 'webcontainer';
}