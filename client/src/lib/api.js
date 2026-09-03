import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Public endpoints - NEVER send auth token, NEVER try to refresh on 401
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/verify-login-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
]

// Request interceptor - add auth token (skip for public endpoints)
api.interceptors.request.use(
  (config) => {
    const url = config.url || ''
    const isPublic = PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))

    if (!isPublic) {
      const token = localStorage.getItem('cgp_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh & errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const url = originalRequest?.url || ''

    // Don't try to refresh on public endpoints (login, register, etc.)
    const isPublic = PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))
    if (isPublic) {
      const message = error.response?.data?.message || 'Something went wrong'
      error.message = message
      return Promise.reject(error)
    }

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('cgp_refresh')
      if (!refreshToken) {
        localStorage.removeItem('cgp_token')
        window.location.href = '/login'
        return new Promise(() => {})
      }

      try {
        const res = await api.post('/auth/refresh-token', { refreshToken })
        const { accessToken } = res.data.data

        localStorage.setItem('cgp_token', accessToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return api.request(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('cgp_token')
        localStorage.removeItem('cgp_refresh')
        window.location.href = '/login'
        return new Promise(() => {})
      }
    }

    const message = error.response?.data?.message || 'Something went wrong'
    error.message = message
    return Promise.reject(error)
  }
)

export default api