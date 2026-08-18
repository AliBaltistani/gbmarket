import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <CartProvider>
        <Toaster position="top-center" />
        <App />
      </CartProvider>
    </HelmetProvider>
  </StrictMode>,
)
