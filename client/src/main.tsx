
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/responsive-overrides.css';
import { ThemeProvider } from "./lib/ThemeContext";
import { ToastProvider } from "./components/ui/Toast";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ThemeProvider>
);
