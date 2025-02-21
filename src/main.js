import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TooltipProvider } from './components/ui/tooltip';
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(TooltipProvider, { children: _jsx(App, {}) }) }));
