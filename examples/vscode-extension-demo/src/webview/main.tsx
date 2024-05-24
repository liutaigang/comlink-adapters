import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { JsonrpcClientContextProvider } from './contexts/remote-context.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <JsonrpcClientContextProvider>
      <App />
    </JsonrpcClientContextProvider>
  </React.StrictMode>
)
