import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Filler, Title,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Title)

const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16']

// ── Donut: portfolio distribution ─────────────────────────
export function PortfolioPieChart({ holdings }) {
  if (!holdings?.length) return <EmptyChart text="No holdings yet" />
  const data = {
    labels: holdings.map(h => h.symbol),
    datasets: [{ data: holdings.map(h => h.currentValue), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 8 }],
  }
  const options = {
    responsive: true, maintainAspectRatio: false, cutout: '72%',
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12, boxWidth: 10, borderRadius: 3 } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: $${ctx.raw.toFixed(2)}` }, backgroundColor: '#1a2235', titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 10, cornerRadius: 8 },
    },
  }
  return <Doughnut data={data} options={options} />
}

// ── Bar: buy vs sell monthly ───────────────────────────────
export function ActivityBarChart({ data: raw }) {
  if (!raw?.length) return <EmptyChart text="No transactions yet" />
  const data = {
    labels: raw.map(r => r.month),
    datasets: [
      { label: 'Bought', data: raw.map(r => parseFloat(r.bought || 0)), backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6, borderSkipped: false },
      { label: 'Sold',   data: raw.map(r => parseFloat(r.sold || 0)),   backgroundColor: 'rgba(239,68,68,0.7)',  borderRadius: 6, borderSkipped: false },
    ],
  }
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, borderRadius: 3 } },
      tooltip: { backgroundColor: '#1a2235', titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 10, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 }, callback: v => `$${(v/1000).toFixed(0)}k` } },
    },
  }
  return <Bar data={data} options={options} />
}

// ── Placeholder when no data ──────────────────────────────
function EmptyChart({ text }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500">
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-3">
        <span className="text-2xl">📊</span>
      </div>
      <p className="text-sm">{text}</p>
    </div>
  )
}
