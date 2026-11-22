import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { applyDemo } from './dev/demo.js';

if (import.meta.env.DEV) applyDemo();
import { StoreProvider } from './context/StoreContext.jsx';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/create.css';
import './styles/commerce.css';
import './styles/refine.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
