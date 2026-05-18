import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import TradeModal from '../../components/common/TradeModal'
import { PortfolioPieChart } from '../../components/charts/Charts'
import { SkeletonTable } from '../../components/common/Skeleton'
import StatCard from '../../components/common/StatCard'

import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiBriefcaseLine,
  RiPieChartLine,
  RiMoneyDollarCircleLine,
  RiStockLine,
} from 'react-icons/ri'

export default function PortfolioPage() {
  const { formatCurrency, convertPrice } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState({
    open: false,
    stock: null,
    mode: 'buy',
    ownedQty: 0,
  })

  const fetchPortfolio = () => {
    setLoading(true)

    api.get('/portfolio')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const s = data?.summary || {}
  const isProfitable = (s.totalProfitLoss || 0) >= 0

  const openTrade = (holding, mode) => {
    setModal({
      open: true,
      mode,
      ownedQty: holding.quantity,
      stock: {
        id: holding.stockId,
        symbol: holding.symbol,
        company_name: holding.companyName,
        current_price: holding.currentPrice,
        previous_price: holding.previousPrice,
        available_quantity: 99999,
      },
    })
  }

  return (
    <div className="space-y-6 animate-slide-up">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          loading={loading}
          title="Portfolio Value"
          value={
            loading
              ? '—'
              : formatCurrency(convertPrice(s.totalCurrentValue || 0))
          }
          icon={RiBriefcaseLine}
          color="blue"
        />

        <StatCard
          loading={loading}
          title="Amount Invested"
          value={
            loading
              ? '—'
              : formatCurrency(convertPrice(s.totalInvested || 0))
          }
          icon={RiMoneyDollarCircleLine}
          color="purple"
        />

        <StatCard
          loading={loading}
          title="Total P&L"
          value={
            loading
              ? '—'
              : `${isProfitable ? '+' : '−'}${formatCurrency(
                  convertPrice(Math.abs(s.totalProfitLoss || 0))
                )}`
          }
          icon={isProfitable ? RiArrowUpLine : RiArrowDownLine}
          color={isProfitable ? 'green' : 'red'}
          trend={s.totalReturnPct}
        />

        <StatCard
          loading={loading}
          title="Positions"
          value={loading ? '—' : s.stockCount || 0}
          icon={RiPieChartLine}
          color="yellow"
          sub="open positions"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="card p-5">
          <h3 className="font-semibold text-white text-sm mb-4">
            Distribution
          </h3>

          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
              </div>
            ) : (
              <PortfolioPieChart holdings={data?.holdings} />
            )}
          </div>
        </div>

        <div className="lg:col-span-2 card overflow-hidden">

          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">
              Holdings
            </h3>

            <Link
              to="/stocks"
              className="text-xs text-brand-blue hover:text-blue-400"
            >
              + Add position
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-white/5 bg-dark-800/40">
                  {['Stock', 'Qty', 'Avg Buy', 'Current', 'Value', 'P&L', ''].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {loading ? (
                <SkeletonTable rows={5} cols={7} />
              ) : (
                <tbody className="divide-y divide-white/[0.04]">

                  {data?.holdings?.length ? (
                    data.holdings.map(h => {

                      const pl = h.profitLoss
                      const up = pl >= 0

                      return (
                        <tr
                          key={h.id}
                          className="hover:bg-dark-600/30 transition-colors"
                        >

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">

                              <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center text-xs font-bold text-brand-blue shrink-0">
                                {h.symbol?.slice(0, 2)}
                              </div>

                              <div>
                                <p className="font-semibold text-white text-sm">
                                  {h.symbol}
                                </p>

                                <p className="text-xs text-slate-500 max-w-[120px] truncate">
                                  {h.companyName}
                                </p>
                              </div>

                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-mono text-slate-300">
                            {h.quantity}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-slate-400 text-xs">
                            {formatCurrency(convertPrice(h.avgBuyPrice))}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-white font-medium">
                            {formatCurrency(convertPrice(h.currentPrice))}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-slate-200">
                            {formatCurrency(convertPrice(h.currentValue))}
                          </td>

                          <td className="px-4 py-3.5">

                            <div className={`flex items-center gap-0.5 font-mono text-sm font-semibold ${
                              up ? 'text-emerald-400' : 'text-red-400'
                            }`}>

                              {up
                                ? <RiArrowUpLine size={13} />
                                : <RiArrowDownLine size={13} />
                              }

                              {formatCurrency(convertPrice(Math.abs(pl)))}
                            </div>

                            <p className={`text-xs ${
                              up ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                              {up ? '+' : ''}
                              {h.returnPct}%
                            </p>

                          </td>

                          <td className="px-4 py-3.5">

                            <div className="flex gap-1.5">

                              <button
                                onClick={() => openTrade(h, 'buy')}
                                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/15 font-medium transition-all"
                              >
                                Buy
                              </button>

                              <button
                                onClick={() => openTrade(h, 'sell')}
                                className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 font-medium transition-all"
                              >
                                Sell
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-16">

                        <RiStockLine className="text-4xl text-slate-700 mx-auto mb-3" />

                        <p className="text-slate-500 text-sm">
                          No holdings yet.
                        </p>

                        <Link
                          to="/stocks"
                          className="text-brand-blue text-sm hover:text-blue-400 mt-1 inline-block"
                        >
                          Browse the market →
                        </Link>

                      </td>
                    </tr>
                  )}

                </tbody>
              )}

            </table>
          </div>
        </div>
      </div>

      <TradeModal
        isOpen={modal.open}
        onClose={() =>
          setModal(m => ({
            ...m,
            open: false,
          }))
        }
        stock={modal.stock}
        mode={modal.mode}
        ownedQty={modal.ownedQty}
        onSuccess={fetchPortfolio}
      />
    </div>
  )
}