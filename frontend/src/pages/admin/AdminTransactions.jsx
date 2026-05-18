import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import { SkeletonTable } from '../../components/common/Skeleton'
import {
  RiSearchLine, RiFilterLine,
  RiArrowUpLine, RiArrowDownLine,
  RiArrowLeftLine, RiArrowRightLine,
  RiExchangeDollarLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function AdminTransactions() {
  const [data, setData]           = useState({ transactions: [], pagination: {} })
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage]           = useState(1)
  const LIMIT = 15

  const fetchTxns = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: LIMIT })
    api.get(`/admin/transactions?${params}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { fetchTxns() }, [fetchTxns])
  useEffect(() => { setPage(1) }, [typeFilter, search])

  const { transactions, pagination } = data

  // Client-side filter (admin endpoint returns all, filter locally for simplicity)
  const filtered = transactions.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.company_name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q) || t.user_name.toLowerCase().includes(q) || t.user_email.toLowerCase().includes(q)
    const matchType = !typeFilter || t.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="space-y-5 animate-slide-up">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white">All Transactions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {pagination.total ? `${pagination.total} total trades across all users` : 'Platform-wide trade history'}
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Trades',    value: pagination.total || 0, color: 'text-white' },
          { label: 'This Page',       value: transactions.length,   color: 'text-white' },
          { label: 'Buy Trades',      value: transactions.filter(t => t.type === 'BUY').length,  color: 'text-emerald-400' },
          { label: 'Sell Trades',     value: transactions.filter(t => t.type === 'SELL').length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 border border-white/5">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search by stock, user name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <RiFilterLine className="text-slate-500" size={15} />
          {[['', 'All Types'], ['BUY', 'Buy Only'], ['SELL', 'Sell Only']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all duration-150
                ${typeFilter === val
                  ? val === 'BUY'  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                  : val === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                  : 'bg-brand-purple text-white'
                  : 'bg-dark-600 text-slate-400 hover:text-slate-200 border border-white/5'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-dark-800/50">
                {['#', 'Type', 'Stock', 'User', 'Qty', 'Price', 'Total', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            {loading
              ? <SkeletonTable rows={12} cols={8} />
              : (
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.length ? filtered.map((t, idx) => {
                    const isBuy = t.type === 'BUY'
                    const rowNum = (pagination.page - 1) * LIMIT + idx + 1
                    return (
                      <tr key={t.id} className="hover:bg-dark-600/30 transition-colors">
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{rowNum}</td>
                        <td className="px-5 py-3.5">
                          <span className={isBuy ? 'badge-buy' : 'badge-sell'}>
                            {isBuy ? <RiArrowUpLine size={11} /> : <RiArrowDownLine size={11} />}
                            {t.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-white font-mono">{t.symbol}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[130px]">{t.company_name}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-200 truncate max-w-[130px]">{t.user_name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[130px]">{t.user_email}</p>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-400">{t.quantity}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">${parseFloat(t.price).toFixed(2)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono font-semibold ${isBuy ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isBuy ? '−' : '+'}${parseFloat(t.total_amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <br />
                          <span className="text-slate-600">{new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <RiExchangeDollarLine className="text-4xl text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No transactions found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              )
            }
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Page <span className="text-white font-medium">{pagination.page}</span> of{' '}
              <span className="text-white font-medium">{pagination.totalPages}</span>
              {' '}· {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg bg-dark-600 border border-white/5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <RiArrowLeftLine size={15} />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const pg = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i
                if (pg > pagination.totalPages) return null
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all
                      ${pagination.page === pg ? 'bg-brand-purple text-white' : 'bg-dark-600 border border-white/5 text-slate-400 hover:text-slate-200'}`}
                  >
                    {pg}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg bg-dark-600 border border-white/5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <RiArrowRightLine size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
