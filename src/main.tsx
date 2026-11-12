import '@fontsource-variable/inter'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useIsland } from './island/store'
import './index.css'

// Dev handle for driving the island from the console: island.getState().trigger('music')
if (import.meta.env.DEV) Object.assign(window, { island: useIsland })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
