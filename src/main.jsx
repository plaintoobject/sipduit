import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './globals.css';

import { Router } from 'wouter';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
