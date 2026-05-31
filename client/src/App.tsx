import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditorLayout from '@/features/editor/components/EditorLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/editor/:projectId" element={<EditorLayout />} />
      </Routes>
    </BrowserRouter>
  );
}