import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { RiCloseLine, RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function TradeModal({ isOpen, onClose, stock, mode = 'buy', ownedQty = 0, onSuccess }) {
  const { formatCurrency, updateWallet, convertPrice } = useAuth()
  const [qty, setQty]         = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (isOpen) setQty(1) }, [isOpen])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) { document.addEventListener('keydown', handleKey); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = '' }
  }, [isOpen, onClose])

  if (!isOpen || !stock) return null

  const price = parseFloat(stock.current_price)
  const total = price * qty
  const isBuy = mode === 'buy'

  const handleTrade = async () => {
    setLoading(true)
    try {
      const endpoint = isBuy ? '/stocks/buy' : '/stocks/sell'
      const { data } = await api.post(endpoint, { stockId: stock.id, quantity: qty })
      updateWallet(data.newWalletBalance)
      toast.success(data.message)
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed.')
    } finally {
      setLoading(false)
    }
  }

  const changePct = stock.previous_price
    ? (((price - parseFloat(stock.previous_price)) / parseFloat(stock.previous_price)) * 100)
    : 0
  const isUp = changePct >= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card border border-white/10 w-full max-w-md p-6 animate-slide-up shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
              ${isBuy ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
              {stock.symbol?.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-white">{isBuy ? 'Buy' : 'Sell'} {stock.symbol}</h3>
              <p className="text-xs text-slate-500">{stock.company_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-500 text-slate-400 transition-colors">
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* Price */}
        <div className="bg-dark-600 rounded-xl p-4 mb-5 border border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Current Price</p>
            <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? <RiArrowUpLine /> : <RiArrowDownLine />}{Math.abs(changePct).toFixed(2)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-white font-mono mt-1">{formatCurrency(convertPrice(price))}</p>
          {!isBuy && <p className="text-xs text-slate-500 mt-1">You own: <span className="text-slate-300 font-medium">{ownedQty} shares</span></p>}
          {isBuy && <p className="text-xs text-slate-500 mt-1">Available: <span className="text-slate-300 font-medium">{stock.available_quantity} shares</span></p>}
        </div>

        {/* Quantity */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-400 mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-lg bg-dark-600 border border-white/10 text-slate-300 hover:bg-dark-500 flex items-center justify-center text-lg font-bold transition-colors"
            >−</button>
            <input
              type="number"
              min={1}
              max={isBuy ? stock.available_quantity : ownedQty}
              value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="input text-center text-lg font-bold flex-1"
            />
            <button
              onClick={() => setQty(q => isBuy ? Math.min(stock.available_quantity, q + 1) : Math.min(ownedQty, q + 1))}
              className="w-10 h-10 rounded-lg bg-dark-600 border border-white/10 text-slate-300 hover:bg-dark-500 flex items-center justify-center text-lg font-bold transition-colors"
            >+</button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-dark-600 rounded-xl p-4 mb-5 border border-white/5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Price per share</span>
            <span className="text-white font-mono">{formatCurrency(convertPrice(price))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Quantity</span>
            <span className="text-white font-mono">{qty}</span>
          </div>
          <div className="border-t border-white/5 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-slate-300">Total</span>
            <span className={`font-mono ${isBuy ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(convertPrice(total))}</span>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleTrade}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50
            ${isBuy
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
            }`}
        >
          {loading ? 'Processing…' : isBuy ? `Buy ${qty} Share${qty > 1 ? 's' : ''}` : `Sell ${qty} Share${qty > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}
