

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Polyfill process for browser compatibility with some Node.js libraries
// This is necessary if libraries implicitly try to access `process.env`
// even when an API key is provided directly to their constructor.
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);