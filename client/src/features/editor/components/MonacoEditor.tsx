import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import '@/lib/monaco';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MonacoEditor({ value, onChange }: MonacoEditorProps) {
  const [fontSize, setFontSize] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) setFontSize(10);
      else if (width < 768) setFontSize(11);
      else setFontSize(12);
    };

    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <Editor
        height="100%"
        defaultLanguage="html"
        theme="vs-dark"
        value={value}
        onChange={(val?: string) => onChange(val || '')}
        options={{
          fontSize,
          minimap: { enabled: fontSize > 10 }, // hide minimap on very small screens
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