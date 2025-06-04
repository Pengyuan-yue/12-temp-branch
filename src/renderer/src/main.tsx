import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './globals.css'

// 添加全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

// 确保DOM已加载
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded')
})

console.log('Main.tsx loaded')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
} else {
  console.log('Root element found, creating React app')
  
  try {
    const root = createRoot(rootElement)
    root.render(
  <React.StrictMode>
        <ErrorBoundary>
    <App />
        </ErrorBoundary>
  </React.StrictMode>
) 
    console.log('React app rendered successfully')
  } catch (error) {
    console.error('Failed to render React app:', error)
  }
} 