import apiClient from '../api/client'

export const authService = {
  login: async (email, password) => {
    await apiClient.post('/auth/login', { email, password })
    localStorage.setItem('user', JSON.stringify({ email }))   // ← ЭТА СТРОКА
  },

  register: async (userData) => {
    await apiClient.post('/auth/register', userData)
    localStorage.setItem('user', JSON.stringify({
      username: userData.username,
      email: userData.email,
    }))
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/sign-out')
    } catch (e) { /* ignore */ }
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => !!localStorage.getItem('user'),
}