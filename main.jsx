import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './client/src/pages/App';
import './client/src/index.css';

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Error</h1><p>${error.message}</p></div>`;
}
