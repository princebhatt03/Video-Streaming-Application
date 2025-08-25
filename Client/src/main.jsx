import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Toaster } from 'react-hot-toast';
import './index.css';

// ✅ Polyfills for simple-peer & node modules
import { Buffer } from 'buffer';
import process from 'process';

window.Buffer = Buffer;
window.process = process;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </BrowserRouter>
  </React.StrictMode>
);
