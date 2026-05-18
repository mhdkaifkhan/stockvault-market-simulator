import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  RiDashboardLine, RiStockLine, RiGroupLine,
  RiExchangeDollarLine, RiLogoutBoxLine,
  RiShieldLine, RiMenuFoldLine, RiMenuUnfoldLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { useState } from 'react'

const navItems = [
  { to: '/admin/dashboard',    icon: RiDashboardLine,      label: 'Dashboard'    },
  { to: '/admin/stocks',       icon: RiStockLine,          label: 'Stocks'       },
  { to: '/admin/users',        icon: RiGroupLine,          label: 'Users'        },
  { to: '/admin/transactions', icon: RiExchangeDollarLine, label: 'Transactions' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Admin logged out')
    navigate('/admin/login')
  }

  return (
    <aside className={`flex flex-col bg-dark-800 border-r border-white/5 transition-all duration-300 shrink-0 ${collapsed ? 'w-[72px]' : 'w-60'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="flex items-center justify-center w-9 h-9 bg-brand-purple rounded-xl shrink-0">
          <RiShieldLine className="text-white text-lg" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-white text-sm tracking-wide">StockVault</p>
            <p className="text-xs text-brand-purple">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
        >
          {collapsed ? <RiMenuUnfoldLine size={18} /> : <RiMenuFoldLine size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 mt-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
               ${isActive
                 ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/20'
                 : 'text-slate-400 hover:text-slate-200 hover:bg-dark-600'
               }
               ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : ''}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-indigo flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
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
                      ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : ''}
        >
          <RiLogoutBoxLine size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
