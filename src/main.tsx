import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/globals.css';

import App from '@/App';
import { Router } from 'wouter';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
