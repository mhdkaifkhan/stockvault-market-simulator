import { useState, useEffect } from 'react'
import api from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { ActivityBarChart } from '../../components/charts/Charts'
import {
  RiGroupLine, RiStockLine, RiExchangeDollarLine,
  RiMoneyDollarCircleLine, RiArrowUpLine, RiArrowDownLine,
} from 'react-icons/ri'

export default function AdminDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const s = data?.stats || {}

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
  const fmtNum = (n) => new Intl.NumberFormat('en-US').format(n || 0)

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard loading={loading} title="Total Users"       value={loading ? '—' : fmtNum(s.totalUsers)}   icon={RiGroupLine}              color="blue"   sub="registered" />
        <StatCard loading={loading} title="Total Stocks"      value={loading ? '—' : fmtNum(s.totalStocks)}  icon={RiStockLine}              color="purple" sub="listed" />
        <StatCard loading={loading} title="Total Trades"      value={loading ? '—' : fmtNum(s.totalTxns)}    icon={RiExchangeDollarLine}     color="yellow" sub="all-time" />
        <StatCard loading={loading} title="Total Volume"      value={loading ? '—' : fmt(s.totalVolume)}     icon={RiMoneyDollarCircleLine}  color="green"  sub="traded" />
        <StatCard loading={loading} title="Buy Volume"        value={loading ? '—' : fmt(s.buyVolume)}       icon={RiArrowUpLine}         color="green"  sub="purchased" />
        <StatCard loading={loading} title="Sell Volume"       value={loading ? '—' : fmt(s.sellVolume)}      icon={RiArrowUpLine}         color="red"    sub="liquidated" />
      </div>

      {/* Recent users + recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Users */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Recent Users</h3>
            <span className="text-xs text-slate-500">{fmtNum(s.totalUsers)} total</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-dark-500 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-dark-500 rounded w-32" />
                      <div className="h-3 bg-dark-500 rounded w-44" />
                    </div>
                    <div className="h-3.5 bg-dark-500 rounded w-20" />
                  </div>
                ))
              : data?.recentUsers?.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-dark-600/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-indigo flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {u.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                    <p className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                      {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Recent Transactions</h3>
            <span className="text-xs text-slate-500">{fmtNum(s.totalTxns)} total</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-dark-500 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-dark-500 rounded w-28" />
                      <div className="h-3 bg-dark-500 rounded w-36" />
                    </div>
                    <div className="h-3.5 bg-dark-500 rounded w-16" />
                  </div>
                ))
              : data?.recentTransactions?.map(t => {
                  const isBuy = t.type === 'BUY'
                  return (
                    <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-dark-600/30 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isBuy ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                        {isBuy
                          ? <RiArrowUpLine className="text-emerald-400 text-sm" />
                          : <RiArrowDownLine className="text-red-400 text-sm" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{t.symbol} · {t.user_name}</p>
                        <p className="text-xs text-slate-500">{t.quantity} shares · {new Date(t.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`font-mono text-xs font-semibold shrink-0 ${isBuy ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isBuy ? '−' : '+'}${parseFloat(t.total_amount).toFixed(0)}
                      </span>
                    </div>
                  )
                })
            }
          </div>
        </div>
      </div>
    </div>
  )
}
