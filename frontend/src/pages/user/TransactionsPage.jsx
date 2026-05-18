import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { SkeletonTable } from '../../components/common/Skeleton'
import {
  RiSearchLine, RiArrowUpLine, RiArrowDownLine,
  RiFilterLine, RiArrowLeftLine, RiArrowRightLine,
  RiExchangeDollarLine,
} from 'react-icons/ri'

export default function TransactionsPage() {
  const { formatCurrency, convertPrice } = useAuth()
  const [data, setData]       = useState({ transactions: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage]       = useState(1)
  const LIMIT = 12

  const fetchTxns = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: LIMIT })
    if (search)     params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    api.get(`/transactions?${params}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, search, typeFilter])

  useEffect(() => { fetchTxns() }, [fetchTxns])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, typeFilter])

  const { transactions, pagination } = data

  return (
    <div className="space-y-5 animate-slide-up">

      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Transaction History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {pagination.total ? `${pagination.total} total transactions` : 'All your trades in one place'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search by company or symbol…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <RiFilterLine className="text-slate-500" size={15} />
          {[['', 'All'], ['BUY', 'Buy Only'], ['SELL', 'Sell Only']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all duration-150
                ${typeFilter === val
                  ? val === 'BUY'  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                  : val === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                  : 'bg-brand-blue text-white'
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
                {['#', 'Type', 'Company', 'Symbol', 'Qty', 'Price', 'Total', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            {loading
              ? <SkeletonTable rows={10} cols={8} />
              : (
                <tbody className="divide-y divide-white/[0.04]">
                  {transactions.length ? transactions.map((t, idx) => {
                    const isBuy = t.type === 'BUY'
                    const rowNum = (pagination.page - 1) * LIMIT + idx + 1
                    return (
                      <tr key={t.id} className="hover:bg-dark-600/30 transition-colors">
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{rowNum}</td>
                        <td className="px-5 py-3.5">
                          <span className={isBuy ? 'badge-buy' : 'badge-sell'}>
                            {isBuy ? <RiArrowUpLine size={11}/> : <RiArrowDownLine size={11}/>}
                            {t.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-white truncate max-w-[160px]">{t.company_name}</p>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-medium text-slate-300">{t.symbol}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-400">{t.quantity}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">{formatCurrency(convertPrice(parseFloat(t.price)))}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono font-semibold ${isBuy ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isBuy ? '−' : '+'}{formatCurrency(convertPrice(parseFloat(t.total_amount)))}
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
              {/* Page numbers */}
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const pg = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i
                if (pg > pagination.totalPages) return null
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all
                      ${pagination.page === pg ? 'bg-brand-blue text-white' : 'bg-dark-600 border border-white/5 text-slate-400 hover:text-slate-200'}`}
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
