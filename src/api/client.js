import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,   // ⚠️ ВАЖНО для сессий (JSESSIONID)
  timeout: 10000,
})

export default apiClient