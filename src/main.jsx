import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { Toaster } from 'react-hot-toast'
import CashProvider from './contexts/CashProvider'
import AuthProvider from './contexts/AuthProvider'
import LanguageProvider from './contexts/LanguageProvider'
import { ProductSelectionProvider } from './contexts/ProductSelectionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <CashProvider>
          <ProductSelectionProvider>
            <RouterProvider router={router} />
            <Toaster />
          </ProductSelectionProvider>
        </CashProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
