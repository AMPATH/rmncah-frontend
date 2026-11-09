import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'

import { initializeDemoData } from './core/data/seed/seed-initializer'

// Initialize local demo data before mounting the application.
const seedResult = initializeDemoData()

console.info('[EmONC] Demo data initialization:', seedResult)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)