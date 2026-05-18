import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { PortfolioPieChart, ActivityBarChart } from '../../components/charts/Charts'

import {
  RiWalletLine,
  RiBriefcaseLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiPieChartLine,
  RiArrowRightLine,
} from 'react-icons/ri'

export default function DashboardPage() {

  const { formatCurrency, convertPrice } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/portfolio/dashboard')
      .then(r => {
        console.log(r.data)
        setData(r.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // FIXED
  const s = data?.stats || {}

  const isProfitable = (s.profitLoss || 0) >= 0

  return (
    <div className="space-y-6 animate-slide-up">

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

        <StatCard
          title="Wallet Balance"
          value={formatCurrency(convertPrice(Number(s.walletBalance || 0)))}
          icon={RiWalletLine}
          color="blue"
        />

        <StatCard
          title="Portfolio Value"
          value={formatCurrency(convertPrice(Number(s.portfolioValue || 0)))}
          icon={RiBriefcaseLine}
          color="purple"
        />

        <StatCard
          title="Invested Amount"
          value={formatCurrency(convertPrice(Number(s.investedAmount || 0)))}
          icon={RiPieChartLine}
          color="yellow"
        />

        <StatCard
          title="Total P&L"
          value={formatCurrency(convertPrice(Number(Math.abs(s.profitLoss || 0))))}
          icon={isProfitable ? RiArrowUpLine : RiArrowDownLine}
          color={isProfitable ? 'green' : 'red'}
          trend={s.returnPct}
          sub={isProfitable ? 'Gain' : 'Loss'}
        />

        <StatCard
          title="Stocks Owned"
          value={Number(s.stockCount || 0)}
          icon={RiArrowUpLine}
          color="blue"
          sub="positions"
        />

        <StatCard
          title="Net Worth"
          value={formatCurrency(
            convertPrice(
              Number(s.walletBalance || 0) +
              Number(s.portfolioValue || 0)
            )
          )}
          icon={RiWalletLine}
          color="green"
          sub="wallet + portfolio"
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card p-5">

          <div className="flex items-center justify-between mb-4">

            <h3 className="font-semibold text-white text-sm">
              Portfolio Distribution
            </h3>

            <Link
              to="/portfolio"
              className="text-xs text-brand-blue hover:text-blue-400 flex items-center gap-1"
            >
              View all <RiArrowRightLine />
            </Link>

          </div>

          <div className="h-52">

            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
              </div>
            ) : (
              <PortfolioPieChart
                holdings={data?.topHoldings?.map(h => ({
                  symbol: h.symbol,
                  currentValue: parseFloat(h.value),
                })) || []}
              />
            )}

          </div>

        </div>

        <div className="card p-5">

          <div className="flex items-center justify-between mb-4">

            <h3 className="font-semibold text-white text-sm">
              Buy vs Sell Activity
            </h3>

            <Link
              to="/transactions"
              className="text-xs text-brand-blue hover:text-blue-400 flex items-center gap-1"
            >
              View all <RiArrowRightLine />
            </Link>

          </div>

          <div className="h-52">

            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
              </div>
            ) : (
              <ActivityBarChart data={data?.monthlyActivity || []} />
            )}

          </div>

        </div>

      </div>

    </div>
  )
}