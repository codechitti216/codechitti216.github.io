import React from 'react'
import ReactDOM from 'react-dom/client'
import 'katex/dist/katex.min.css';
import './index.css'
import App from './App.jsx'

// DEBUG: This version has been deployed - Version 2.1 with Research Dashboard removed and SPA routing fixed
console.log('🚀 DEPLOYED VERSION 2.1 - Research Dashboard removed, SPA routing fixed!', new Date().toISOString());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
