import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
console.log('React app loaded');
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
