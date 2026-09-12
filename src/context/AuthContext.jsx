import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(authService.getCurrentUser())
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    await authService.login(email, password)
    // После успешного запроса берём user из localStorage
    setUser(authService.getCurrentUser())
  }

  const register = async (userData) => {
    await authService.register(userData)
    setUser(authService.getCurrentUser())
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}