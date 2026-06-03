import Editor from '@monaco-editor/react';
import '@/lib/monaco';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MonacoEditor({ value, onChange }: MonacoEditorProps) {
  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <Editor
        height="100%"
        defaultLanguage="html"
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          fontSize: 12,
          minimap: { enabled: false },
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 10 },
          fontFamily: 'ui-monospace, Consolas, monospace',
          lineNumbers: 'on',
          folding: true,
          formatOnPaste: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}