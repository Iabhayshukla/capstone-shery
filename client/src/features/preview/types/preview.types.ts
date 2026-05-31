export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export interface SectionClickMessage {
  type: 'section_click';
  sectionId: string;
}

export interface ConsoleErrorMessage {
  type: 'console_error';
  message: string;
}

export type IframeMessage = SectionClickMessage | ConsoleErrorMessage;

export interface WebContainerStatus {
  status: 'idle' | 'booting' | 'installing' | 'ready' | 'error';
  error?: string;
}