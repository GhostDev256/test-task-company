if (sessionStorage.getItem('spaRedirect')) {
  const redirectPath = sessionStorage.getItem('spaRedirect');
  sessionStorage.removeItem('spaRedirect');
  window.history.replaceState(null, '', redirectPath);
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
