import React from 'react'
import ReactDOM from 'react-dom/client'
import 'katex/dist/katex.min.css';
import './index.css'
import App from './App.jsx'

// DEBUG: This version has been deployed - Version 2.0 with fixed GitHub Pages redirect
console.log('🚀 DEPLOYED VERSION 2.0 - GitHub Pages redirect fixed!', new Date().toISOString());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
