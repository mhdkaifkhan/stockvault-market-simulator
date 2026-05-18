import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RiSunLine, RiMoonLine, RiNotificationLine, RiSearchLine } from 'react-icons/ri'
import { useState } from 'react'

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',      sub: 'Welcome back' },
  '/stocks':       { title: 'Market',         sub: 'Live stock data' },
  '/portfolio':    { title: 'Portfolio',      sub: 'Your holdings' },
  '/transactions': { title: 'Transactions',   sub: 'Trade history' },
  '/settings':     { title: 'Settings',       sub: 'Preferences' },
}

export default function Topbar() {
  const { user, theme, toggleTheme, currency, toggleCurrency } = useAuth()
  const { pathname } = useLocation()
  const page = PAGE_TITLES[pathname] || { title: 'StockVault', sub: '' }

  return (
    <header className="bg-dark-800/80 backdrop-blur-sm border-b border-white/5 px-6 py-3.5 flex items-center justify-between shrink-0">
      {/* Page info */}
      <div>
        <h1 className="text-lg font-bold text-white">{page.title}</h1>
        <p className="text-xs text-slate-500">{page.sub}, {user?.fullName?.split(' ')[0]}</p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Currency toggle */}
        <div className="flex items-center bg-dark-600 rounded-lg p-1 gap-1 border border-white/5">
          {['USD', 'INR'].map(c => (
            <button
              key={c}
              onClick={() => toggleCurrency(c)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${currency === c ? 'bg-brand-blue text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-dark-600 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-dark-500 transition-all duration-200"
        >
          {theme === 'dark' ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
        </button>

        {/* Notification bell (decorative) */}
        <button className="p-2 rounded-lg bg-dark-600 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-dark-500 transition-all duration-200 relative">
          <RiNotificationLine size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-blue rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-xs font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
