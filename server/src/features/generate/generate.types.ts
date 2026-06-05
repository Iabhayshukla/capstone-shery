export interface GenerateRequestBody {
  /** Free-form prompt describing the website to build (max 2000 chars) */
  prompt: string;

  /** The project this generation belongs to */
  projectId: string;

  /** If provided, only this section will be regenerated */
  sectionId?: string;

  /** The current full-page HTML — required when sectionId is provided */
  currentHtml?: string;
}
