import { useState, useEffect } from 'react'
import api from '../../services/api'
import { SkeletonTable } from '../../components/common/Skeleton'
import { RiSearchLine, RiGroupLine, RiMoneyDollarCircleLine, RiUserLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    api.get('/admin/users')
      .then(r => setUsers(r.data.users || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const totalWallet = users.reduce((s, u) => s + parseFloat(u.wallet_balance || 0), 0)
  const avgWallet   = users.length ? totalWallet / users.length : 0

  return (
    <div className="space-y-5 animate-slide-up">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white">User Management</h2>
        <p className="text-xs text-slate-500 mt-0.5">{users.length} registered traders</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border border-brand-blue/20 stat-glow-blue">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Users</p>
            <div className="p-2 rounded-lg bg-brand-blue/10"><RiGroupLine className="text-brand-blue text-base" /></div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{loading ? '—' : users.length}</p>
          <p className="text-xs text-slate-500 mt-1">registered accounts</p>
        </div>
        <div className="card p-5 border border-brand-green/20 stat-glow-green">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Wallet Funds</p>
            <div className="p-2 rounded-lg bg-brand-green/10"><RiMoneyDollarCircleLine className="text-brand-green text-base" /></div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {loading ? '—' : `$${totalWallet.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          </p>
          <p className="text-xs text-slate-500 mt-1">across all wallets</p>
        </div>
        <div className="card p-5 border border-brand-purple/20 stat-glow-purple">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Wallet Balance</p>
            <div className="p-2 rounded-lg bg-brand-purple/10"><RiUserLine className="text-brand-purple text-base" /></div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {loading ? '—' : `$${avgWallet.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          </p>
          <p className="text-xs text-slate-500 mt-1">per trader</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-dark-800/50">
                {['#', 'User', 'Email', 'Wallet Balance', 'Joined', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            {loading
              ? <SkeletonTable rows={8} cols={6} />
              : (
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((u, i) => (
                    <tr key={u.id} className="hover:bg-dark-600/30 transition-colors">
                      <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-indigo flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.full_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <p className="font-medium text-white">{u.full_name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-semibold text-emerald-400">
                          ${parseFloat(u.wallet_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-14 text-slate-500 text-sm">
                        No users found{search ? ' for your search.' : '.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              )
            }
          </table>
        </div>
      </div>
    </div>
  )
}
