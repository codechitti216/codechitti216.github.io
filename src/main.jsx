import React from 'react'
import ReactDOM from 'react-dom/client'
import 'katex/dist/katex.min.css';
import './index.css'
import App from './App.jsx'

// DEBUG: This version has been deployed - Version 3.0 with extensive debugging
console.log('🚀 DEPLOYED VERSION 3.0 - EXTENSIVE DEBUGGING ENABLED!', new Date().toISOString());
console.log('🔍 DEBUG: main.jsx loaded successfully');
console.log('🔍 DEBUG: React version:', React.version);
console.log('🔍 DEBUG: ReactDOM version:', ReactDOM.version);

console.log('🔍 DEBUG: About to create React root');
const rootElement = document.getElementById('root');
console.log('🔍 DEBUG: Root element found:', rootElement);
console.log('🔍 DEBUG: Root element innerHTML length:', rootElement?.innerHTML?.length || 0);

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('🔍 DEBUG: React root created successfully');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('🔍 DEBUG: App rendered successfully');
} catch (error) {
  console.error('❌ DEBUG: Error during React rendering:', error);
  console.error('❌ DEBUG: Error stack:', error.stack);
}
