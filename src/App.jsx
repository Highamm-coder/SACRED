import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react'
import { logEnvironmentStatus } from '@/utils/environmentValidator'

function App() {
  // Run environment validation on app startup
  useEffect(() => {
    // Only run validation in development mode
    if (import.meta.env.MODE === 'development') {
      logEnvironmentStatus(['payments', 'emails']);
    }
  }, []);

  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 