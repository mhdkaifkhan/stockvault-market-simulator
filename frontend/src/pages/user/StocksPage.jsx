import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import TradeModal from '../../components/common/TradeModal'
import { SkeletonTable } from '../../components/common/Skeleton'
import {
  RiSearchLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFilterLine,
  RiRefreshLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'

const SECTORS = [
  'All',
  'Technology',
  'Finance',
  'Healthcare',
  'Energy',
  'E-Commerce',
  'Automotive',
  'Conglomerate',
  'Telecom',
  'Retail',
  'Consumer Goods',
  'Industrials',
  'Entertainment'
]

export default function StocksPage() {

  const { formatCurrency, convertPrice } = useAuth()

  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('All')

  const [sortBy, setSortBy] = useState('company_name')
  const [sortDir, setSortDir] = useState('asc')

  const [modal, setModal] = useState({
    open: false,
    stock: null,
    mode: 'buy'
  })

  // ─────────────────────────────────────────────
  // FETCH STOCKS
  // ─────────────────────────────────────────────
  const fetchStocks = async (showLoader = false) => {

    try {

      // Show loader only on first/manual refresh
      if (showLoader) {
        setLoading(true)
      }

      const response = await api.get('/stocks')

      setStocks(response.data.stocks || [])

    }
    catch (err) {

      console.error(err)
      toast.error('Failed to load stocks')

    }
    finally {

      if (showLoader) {
        setLoading(false)
      }

    }

  }

  // ─────────────────────────────────────────────
  // AUTO REFRESH MARKET
  // ─────────────────────────────────────────────
  useEffect(() => {

    // First load
    fetchStocks(true)

    // Auto update every 5 sec
    const interval = setInterval(() => {

      fetchStocks(false)

    }, 5000)

    return () => clearInterval(interval)

  }, [])

  const filtered = useMemo(() => {

    let list = stocks.filter(stock => {

      const q = search.toLowerCase()

      const matchSearch =
        !q ||
        stock.company_name.toLowerCase().includes(q) ||
        stock.symbol.toLowerCase().includes(q)

      const matchSector =
        sector === 'All' || stock.sector === sector

      return matchSearch && matchSector
    })

    list.sort((a, b) => {

      let va = a[sortBy]
      let vb = b[sortBy]

      if (typeof va === 'string') {
        va = va.toLowerCase()
        vb = vb.toLowerCase()
      }

      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1

      return 0
    })

    return list

  }, [stocks, search, sector, sortBy, sortDir])

  const toggleSort = (column) => {

    if (sortBy === column) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    }
    else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const changePct = (stock) => {

    if (
      !stock.previous_price ||
      parseFloat(stock.previous_price) === 0
    ) {
      return 0
    }

    return (
      (
        parseFloat(stock.current_price) -
        parseFloat(stock.previous_price)
      ) /
      parseFloat(stock.previous_price)
    ) * 100
  }

  return (
    <div className="space-y-5 animate-slide-up">

      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">

        <div>
          <h2 className="text-lg font-bold text-white">
            Live Market
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length} stocks available
          </p>
        </div>

        <button
          onClick={() => fetchStocks(true)}
          className="btn-secondary text-sm flex items-center gap-2 py-2"
        >
          <RiRefreshLine className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>

      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">

        <div className="relative flex-1 min-w-[200px]">

          <RiSearchLine
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            size={15}
          />

          <input
            type="text"
            placeholder="Search company or symbol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2 text-sm"
          />

        </div>

        <div className="flex items-center gap-2 flex-wrap">

          <RiFilterLine className="text-slate-500" size={15} />

          {SECTORS.map(s => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150
                ${sector === s
                  ? 'bg-brand-blue text-white'
                  : 'bg-dark-600 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
            >
              {s}
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

                {[
                  { label: 'Company', col: 'company_name' },
                  { label: 'Symbol', col: 'symbol' },
                  { label: 'Price', col: 'current_price' },
                  { label: 'Change', col: null },
                  { label: 'Available', col: 'available_quantity' },
                  { label: 'Sector', col: 'sector' },
                  { label: 'Action', col: null },
                ].map(({ label, col }) => (

                  <th
                    key={label}
                    onClick={() => col && toggleSort(col)}
                    className={`text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider select-none
                      ${col ? 'cursor-pointer hover:text-slate-200' : ''}`}
                  >

                    <span className="flex items-center gap-1">
                      {label}
                    </span>

                  </th>

                ))}

              </tr>

            </thead>

            {loading ? (

              <SkeletonTable rows={8} cols={7} />

            ) : (

              <tbody className="divide-y divide-white/[0.04]">

                {filtered.map(stock => {

                  const pct = changePct(stock)

                  const isUp = pct >= 0

                  const price = parseFloat(stock.current_price)

                  return (

                    <tr
                      key={stock.id}
                      className="hover:bg-dark-600/30 transition-colors group"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 rounded-lg bg-dark-500 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                            {stock.symbol?.slice(0, 2)}
                          </div>

                          <div>

                            <p className="font-medium text-white text-sm truncate max-w-[160px]">
                              {stock.company_name}
                            </p>

                            <p className="text-xs text-slate-500 truncate max-w-[160px]">
                              {stock.description?.slice(0, 45)}...
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4 font-mono font-medium text-slate-300 text-sm">
                        {stock.symbol}
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-white">
                        {formatCurrency(convertPrice(price))}
                      </td>

                      <td className="px-5 py-4">

                        <span className={isUp ? 'badge-up' : 'badge-down'}>

                          {isUp
                            ? <RiArrowUpLine />
                            : <RiArrowDownLine />
                          }

                          {Math.abs(pct).toFixed(2)}%

                        </span>

                      </td>

                      <td className="px-5 py-4 text-slate-400 text-sm font-mono">
                        {stock.available_quantity.toLocaleString()}
                      </td>

                      <td className="px-5 py-4">

                        <span className="text-xs text-slate-500 bg-dark-600 border border-white/5 px-2 py-1 rounded-md">
                          {stock.sector}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() =>
                              setModal({
                                open: true,
                                stock,
                                mode: 'buy'
                              })
                            }
                            disabled={stock.available_quantity === 0}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Buy
                          </button>

                          <button
                            onClick={() =>
                              setModal({
                                open: true,
                                stock,
                                mode: 'sell'
                              })
                            }
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 font-medium transition-all"
                          >
                            Sell
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                })}

                {filtered.length === 0 && !loading && (

                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-slate-500 text-sm"
                    >
                      No stocks match your search.
                    </td>
                  </tr>

                )}

              </tbody>

            )}

          </table>

        </div>

      </div>

      <TradeModal
        isOpen={modal.open}
        onClose={() =>
          setModal(m => ({
            ...m,
            open: false
          }))
        }
        stock={modal.stock}
        mode={modal.mode}
        onSuccess={() => fetchStocks(true)}
      />

    </div>
  )
}