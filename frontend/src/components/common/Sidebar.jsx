import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  RiDashboardLine, RiStockLine, RiBriefcaseLine,
  RiExchangeDollarLine, RiSettings4Line, RiLogoutBoxLine,
  RiMenuFoldLine, RiMenuUnfoldLine, RiArrowUpLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',    icon: RiDashboardLine,      label: 'Dashboard' },
  { to: '/stocks',       icon: RiStockLine,          label: 'Market' },
  { to: '/portfolio',    icon: RiBriefcaseLine,      label: 'Portfolio' },
  { to: '/transactions', icon: RiExchangeDollarLine, label: 'Transactions' },
  { to: '/settings',     icon: RiSettings4Line,      label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout, sidebarCollapsed, setSidebarCollapsed, formatCurrency } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <aside
      className={`relative flex flex-col bg-dark-800 border-r border-white/5 transition-all duration-300
                  ${sidebarCollapsed ? 'w-[72px]' : 'w-64'} shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="flex items-center justify-center w-9 h-9 bg-brand-blue rounded-xl shrink-0">
          <RiArrowUpLine className="text-white text-lg" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="font-bold text-white tracking-wide text-sm">StockVault</p>
            <p className="text-xs text-slate-500">Virtual Trading</p>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(p => !p)}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
        >
          {sidebarCollapsed ? <RiMenuUnfoldLine size={18} /> : <RiMenuFoldLine size={18} />}
        </button>
      </div>

      {/* Wallet balance */}
      {!sidebarCollapsed && (
        <div className="mx-3 mt-4 p-3 bg-brand-blue/10 border border-brand-blue/20 rounded-xl">
          <p className="text-xs text-slate-500 mb-1">Wallet Balance</p>
          <p className="font-bold text-brand-blue font-mono text-sm">{formatCurrency(user?.walletBalance || 0)}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 mt-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
               ${isActive
                ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-600'
               }
               ${sidebarCollapsed ? 'justify-center' : ''}`
            }
            title={sidebarCollapsed ? label : ''}
          >
            <Icon size={18} className="shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-white/5">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                      text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
                      ${sidebarCollapsed ? 'justify-center' : ''}`}
          title={sidebarCollapsed ? 'Logout' : ''}
        >
          <RiLogoutBoxLine size={18} />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
