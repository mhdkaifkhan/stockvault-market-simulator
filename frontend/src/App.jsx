import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth Pages
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminLogin   from './pages/auth/AdminLoginPage'

// User Pages
import DashboardPage    from './pages/user/DashboardPage'
import StocksPage       from './pages/user/StocksPage'
import PortfolioPage    from './pages/user/PortfolioPage'
import TransactionsPage from './pages/user/TransactionsPage'
import SettingsPage     from './pages/user/SettingsPage'

// Admin Pages
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminStocks       from './pages/admin/AdminStocks'
import AdminUsers        from './pages/admin/AdminUsers'
import AdminTransactions from './pages/admin/AdminTransactions'

// Layouts
import UserLayout  from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

// Protected route wrappers
const RequireUser = ({ children }) => {
  const { user } = useAuth()
  if (!user || user.role !== 'user') return <Navigate to="/login" replace />
  return children
}
const RequireAdmin = ({ children }) => {
  const { user } = useAuth()
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"        element={user?.role === 'user' ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register"     element={user?.role === 'user' ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/admin/login"  element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />

      {/* User App */}
      <Route path="/" element={<RequireUser><UserLayout /></RequireUser>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="stocks"       element={<StocksPage />} />
        <Route path="portfolio"    element={<PortfolioPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="settings"     element={<SettingsPage />} />
      </Route>

      {/* Admin App */}
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"    element={<AdminDashboard />} />
        <Route path="stocks"       element={<AdminStocks />} />
        <Route path="users"        element={<AdminUsers />} />
        <Route path="transactions" element={<AdminTransactions />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
