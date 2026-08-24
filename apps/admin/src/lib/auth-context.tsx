import { createContext, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SecurityUtils } from './security'

interface AuthContextType {
  token: string | null
  role: string | null
  userId: number | null
  login: (token: string, role: string, userId?: number | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const token = SecurityUtils.getValidToken()
  const role = token ? localStorage.getItem('role') : null
  const userId = token ? Number(localStorage.getItem('userId') || 'null') : null

  const login = useCallback((token: string, role: string, userId?: number | null) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    if (userId) localStorage.setItem('userId', String(userId))
    SecurityUtils.recordAuthTime()
  }, [])

  const logout = useCallback(() => {
    // Clear all sensitive data securely
    SecurityUtils.clearAllSensitiveData()
    
    // Navigate to login with replace to prevent back button
    navigate('/login', { replace: true })
  }, [navigate])

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
