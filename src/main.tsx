import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        routerPush={(to) => window.history.pushState({}, '', to)}
        routerReplace={(to) => window.history.replaceState({}, '', to)}
      >
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
