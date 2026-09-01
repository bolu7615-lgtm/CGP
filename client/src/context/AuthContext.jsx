import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('cgp_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await api.get('/auth/me')
      setUser(res.data.data)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    
    fetchUser()
  }, [fetchUser])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { accessToken, refreshToken, user: userData, requires2FA, userId } = res.data.data

    if (requires2FA) {
      return { requires2FA: true, userId }
    }

    localStorage.setItem('cgp_token', accessToken)
    localStorage.setItem('cgp_refresh', refreshToken)
    setUser(userData)
    return { success: true, user: userData }
  }

  const verify2FA = async (email, otp) => {
    const res = await api.post('/auth/verify-login-otp', { email, otp })
    const { accessToken, refreshToken, user: userData } = res.data.data

    localStorage.setItem('cgp_token', accessToken)
    localStorage.setItem('cgp_refresh', refreshToken)
    setUser(userData)
    return { success: true, user: userData }
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    return res.data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('cgp_token')
    localStorage.removeItem('cgp_refresh')
    setUser(null)
    window.location.href = '/'
  }

  const isAdmin = () => {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  }

  const isSuperAdmin = () => {
    return user?.role === 'SUPER_ADMIN'
  }

  const value = {
    user,
    setUser,
    loading,
    login,
    verify2FA,
    register,
    logout,
    isAdmin,
    isSuperAdmin,
    fetchUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}