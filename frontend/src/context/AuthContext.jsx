import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [loading, setLoading]     = useState(false)
  const [currency, setCurrency]   = useState(localStorage.getItem('currency') || 'USD')
  const [theme, setTheme]         = useState(localStorage.getItem('theme') || 'dark')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('userRole', 'user')
    setUser(data.user)
    return data
  }

  const adminLogin = async (email, password) => {
    const { data } = await api.post('/auth/admin/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('userRole', 'admin')
    setUser(data.user)
    return data
  }

  const register = async (fullName, email, password) => {
    const { data } = await api.post('/auth/register', { fullName, email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('userRole', 'user')
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    setUser(null)
  }

  const updateWallet = useCallback((newBalance) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, walletBalance: newBalance }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const toggleCurrency = (c) => { setCurrency(c); localStorage.setItem('currency', c) }

  // Currency helpers
  const USD_TO_INR = 83.5
  const formatCurrency = (amount) => {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount * USD_TO_INR)
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)
  }
  const convertPrice = (usdPrice) => currency === 'INR' ? usdPrice * USD_TO_INR : usdPrice

  return (
    <AuthContext.Provider value={{
      user, setUser, loading, setLoading,
      login, adminLogin, register, logout, updateWallet,
      currency, toggleCurrency, formatCurrency, convertPrice,
      theme, toggleTheme,
      sidebarCollapsed, setSidebarCollapsed,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
