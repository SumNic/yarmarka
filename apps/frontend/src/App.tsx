import { useEffect } from 'react'
import { AppRouter } from '@/router/AppRouter'
import { useAuthStore } from '@/store/auth/useAuthStore'

import './App.css'

function App() {
  const refreshMe = useAuthStore((s: { refreshMe: () => Promise<void> }) => s.refreshMe)

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  return <AppRouter />
}

export default App
