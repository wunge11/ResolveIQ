/**
 * main.jsx
 * Entry point aplikasi ResolveIQ.
 * Merender React app ke DOM dengan StrictMode untuk mendeteksi masalah potensial.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
