import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri'

export default function StatCard({ title, value, sub, icon: Icon, color = 'blue', trend, loading }) {
  const colors = {
    blue:   { bg: 'bg-brand-blue/10',   icon: 'text-brand-blue',   glow: 'stat-glow-blue',   border: 'border-brand-blue/20' },
    green:  { bg: 'bg-brand-green/10',  icon: 'text-brand-green',  glow: 'stat-glow-green',  border: 'border-brand-green/20' },
    purple: { bg: 'bg-brand-purple/10', icon: 'text-brand-purple', glow: 'stat-glow-purple', border: 'border-brand-purple/20' },
    red:    { bg: 'bg-brand-red/10',    icon: 'text-brand-red',    glow: 'stat-glow-red',    border: 'border-brand-red/20' },
    yellow: { bg: 'bg-brand-yellow/10', icon: 'text-brand-yellow', glow: '',                 border: 'border-brand-yellow/20' },
  }
  const c = colors[color] || colors.blue

  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="skeleton h-4 w-24 rounded mb-3" />
        <div className="skeleton h-7 w-32 rounded mb-2" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    )
  }

  return (
    <div className={`card p-5 ${c.glow} border ${c.border} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon className={`${c.icon} text-base`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white font-mono tracking-tight">{value}</p>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-2">
          {trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? <RiArrowUpLine /> : <RiArrowDownLine />}
              {Math.abs(trend).toFixed(2)}%
            </span>
          )}
          {sub && <span className="text-xs text-slate-500">{sub}</span>}
        </div>
      )}
    </div>
  )
}
