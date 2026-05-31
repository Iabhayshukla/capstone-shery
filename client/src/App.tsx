import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EditorLayout from '@/features/editor/components/EditorLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Baaki routes baad mein Member D add karega */}
        <Route path="/editor/:projectId" element={<EditorLayout />} />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/editor/test-project" replace />} />
      </Routes>
    </BrowserRouter>
  );
}