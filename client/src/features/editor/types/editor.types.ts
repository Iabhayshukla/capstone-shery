export type EditorLanguage =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'markdown'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'sql'
  | 'xml'
  | 'yaml'
  | 'shell'
  | 'plaintext';

export interface StreamingFile {
  name: string;
  content: string;
  language: EditorLanguage;
}