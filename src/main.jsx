import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Generate or retrieve session ID for duplicate detection
if (!localStorage.getItem('sessionId')) {
  const sessionId = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem('sessionId', sessionId);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
