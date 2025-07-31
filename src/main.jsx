import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'katex/dist/katex.min.css'
console.log('[DEBUG] React app loaded');
import './index.css'
import App from './App.jsx'

function debugCssPipeline() {
  // 1. Log all <link rel="stylesheet"> tags
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  if (links.length === 0) {
    console.error('[DEBUG] No CSS <link> found in <head> after React mount');
  } else {
    links.forEach(link => {
      console.log('[DEBUG] CSS <link> after React mount:', link.href);
    });
  }

  // 2. Check for debug bar
  const debugBar = document.querySelector('.bg-yellow-100');
  if (debugBar) {
    console.log('[DEBUG] Found .bg-yellow-100 debug bar. Computed background:', getComputedStyle(debugBar).backgroundColor);
  } else {
    console.warn('[DEBUG] No .bg-yellow-100 debug bar found');
  }

  // 3. Check for Tailwind class in stylesheets
  let foundTailwindClass = false;
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText && rule.selectorText.includes('.bg-yellow-100')) {
          foundTailwindClass = true;
          console.log('[DEBUG] Found .bg-yellow-100 in stylesheet:', sheet.href || '[inline]');
        }
      }
    } catch (e) { /* ignore CORS errors */ }
  }
  if (!foundTailwindClass) {
    console.warn('[DEBUG] .bg-yellow-100 not found in any stylesheet');
  }

  // 4. Check for debug CSS message
  const afterContent = getComputedStyle(document.body, '::after').content;
  console.log('[DEBUG] body::after content:', afterContent);

  // 5. Log computed background color of body
  console.log('[DEBUG] body background:', getComputedStyle(document.body).backgroundColor);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

window.addEventListener('DOMContentLoaded', debugCssPipeline);
window.addEventListener('load', debugCssPipeline);
setTimeout(debugCssPipeline, 1000);
