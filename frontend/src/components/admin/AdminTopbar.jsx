import { useLocation } from 'react-router-dom'
import { RiShieldLine, RiNotificationLine } from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/admin/dashboard':    { title: 'Admin Dashboard',   sub: 'Platform overview'       },
  '/admin/stocks':       { title: 'Stock Management',  sub: 'Add, edit, delete stocks' },
  '/admin/users':        { title: 'User Management',   sub: 'All registered users'    },
  '/admin/transactions': { title: 'All Transactions',  sub: 'Platform-wide trade log'  },
}

export default function AdminTopbar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const page = PAGE_TITLES[pathname] || { title: 'Admin', sub: '' }

  return (
    <header className="bg-dark-800/80 backdrop-blur-sm border-b border-white/5 px-6 py-3.5 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-bold text-white">{page.title}</h1>
        <p className="text-xs text-slate-500">{page.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Admin badge */}
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-3 py-1.5 rounded-lg">
          <RiShieldLine size={13} /> Administrator
        </span>

        {/* Bell */}
        <button className="p-2 rounded-lg bg-dark-600 border border-white/5 text-slate-400 hover:text-slate-200 transition-colors relative">
          <RiNotificationLine size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-purple rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-indigo flex items-center justify-center text-white text-xs font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  )
}
