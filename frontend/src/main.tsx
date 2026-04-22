import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'

// Disable all console logging in production
if (import.meta.env.MODE === 'production' && import.meta.env.VITE_ENABLE_LOGGING !== 'true') {
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)
