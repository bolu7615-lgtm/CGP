// src/lib/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cgp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Track if we're already redirecting to prevent loops
let isRedirecting = false

// Response interceptor - handle token refresh & errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Only skip refresh on the refresh-token endpoint itself (to prevent infinite loops)
      if (originalRequest.url === '/auth/refresh-token') {
        return Promise.reject(error)
      }

      const refreshToken = localStorage.getItem('cgp_refresh')
      if (!refreshToken) {
        if (!isRedirecting) {
          isRedirecting = true
          localStorage.removeItem('cgp_token')
          window.location.href = '/login'
        }
        return new Promise(() => {})
      }

      try {
        // Use api.post (not axios.post) so baseURL is applied
        const res = await api.post('/auth/refresh-token', { refreshToken })
        const { accessToken } = res.data.data

        localStorage.setItem('cgp_token', accessToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return api.request(originalRequest)
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError.response?.data || refreshError.message)
        if (!isRedirecting) {
          isRedirecting = true
          localStorage.removeItem('cgp_token')
          localStorage.removeItem('cgp_refresh')
          window.location.href = '/login'
        }
        return new Promise(() => {})
      }
    }

    const message = error.response?.data?.message || 'Something went wrong'
    error.message = message
    return Promise.reject(error)
  }
)

export default api