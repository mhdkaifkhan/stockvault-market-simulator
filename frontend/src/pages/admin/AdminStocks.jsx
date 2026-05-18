import { useState, useEffect } from 'react'
import api from '../../services/api'
import ConfirmModal from '../../components/common/ConfirmModal'
import { SkeletonTable } from '../../components/common/Skeleton'
import toast from 'react-hot-toast'
import {
  RiAddLine, RiEditLine, RiDeleteBinLine,
  RiCloseLine, RiSaveLine, RiSearchLine,
  RiArrowUpLine, RiArrowDownLine,
} from 'react-icons/ri'

const EMPTY_FORM = {
  companyName: '', symbol: '', currentPrice: '',
  availableQuantity: '', sector: '', description: '',
}

const SECTORS = [
  'Technology', 'Finance', 'Healthcare', 'Energy', 'E-Commerce',
  'Automotive', 'Conglomerate', 'Telecom', 'Retail', 'Consumer Goods',
  'Industrials', 'Entertainment',
]

export default function AdminStocks() {
  const [stocks, setStocks]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editStock, setEditStock] = useState(null)   // null = create mode
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]       = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, stock: null })
  const [deleting, setDeleting]   = useState(false)

  const fetchStocks = () => {
    setLoading(true)
    api.get('/stocks')
      .then(r => setStocks(r.data.stocks || []))
      .catch(() => toast.error('Failed to load stocks'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchStocks() }, [])

  const openCreate = () => {
    setEditStock(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setModalOpen(true)
  }

  const openEdit = (stock) => {
    setEditStock(stock)
    setForm({
      companyName:       stock.company_name,
      symbol:            stock.symbol,
      currentPrice:      stock.current_price,
      availableQuantity: stock.available_quantity,
      sector:            stock.sector || '',
      description:       stock.description || '',
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (!form.companyName.trim())      e.companyName = 'Company name is required.'
    if (!form.symbol.trim())           e.symbol = 'Symbol is required.'
    if (!form.currentPrice || isNaN(form.currentPrice) || parseFloat(form.currentPrice) <= 0)
                                       e.currentPrice = 'Valid price is required.'
    if (!form.availableQuantity || isNaN(form.availableQuantity) || parseInt(form.availableQuantity) < 0)
                                       e.availableQuantity = 'Valid quantity is required.'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      if (editStock) {
        await api.put(`/admin/stocks/${editStock.id}`, form)
        toast.success(`${form.symbol} updated successfully.`)
      } else {
        await api.post('/admin/stocks', form)
        toast.success(`${form.symbol} added to the market.`)
      }
      setModalOpen(false)
      fetchStocks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/stocks/${deleteModal.stock.id}`)
      toast.success(`${deleteModal.stock.symbol} deleted.`)
      setDeleteModal({ open: false, stock: null })
      fetchStocks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = stocks.filter(s => {
    const q = search.toLowerCase()
    return !q || s.company_name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q) || (s.sector || '').toLowerCase().includes(q)
  })

  const changePct = (s) => {
    if (!s.previous_price || parseFloat(s.previous_price) === 0) return 0
    return ((parseFloat(s.current_price) - parseFloat(s.previous_price)) / parseFloat(s.previous_price)) * 100
  }

  return (
    <div className="space-y-5 animate-slide-up">

      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Stock Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">{stocks.length} stocks listed on the platform</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <RiAddLine size={16} /> Add Stock
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search by name, symbol or sector…"
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
                {['Company', 'Symbol', 'Price', 'Change', 'Qty Available', 'Sector', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            {loading
              ? <SkeletonTable rows={8} cols={7} />
              : (
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map(stock => {
                    const pct = changePct(stock)
                    const isUp = pct >= 0
                    return (
                      <tr key={stock.id} className="hover:bg-dark-600/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-dark-500 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                              {stock.symbol?.slice(0, 2)}
                            </div>
                            <p className="font-medium text-white truncate max-w-[160px]">{stock.company_name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-300">{stock.symbol}</td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-white">${parseFloat(stock.current_price).toFixed(2)}</td>
                        <td className="px-5 py-3.5">
                          <span className={isUp ? 'badge-up' : 'badge-down'}>
                            {isUp ? <RiArrowUpLine size={11} /> : <RiArrowDownLine size={11} />}
                            {Math.abs(pct).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-400">{stock.available_quantity.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs bg-dark-600 border border-white/5 text-slate-400 px-2 py-1 rounded-md">{stock.sector || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(stock)}
                              className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 border border-brand-blue/20 transition-all"
                              title="Edit"
                            >
                              <RiEditLine size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ open: true, stock })}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                              title="Delete"
                            >
                              <RiDeleteBinLine size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-14 text-slate-500 text-sm">
                        No stocks found{search ? ' for your search.' : '.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              )
            }
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative card border border-white/10 w-full max-w-lg p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">
                {editStock ? `Edit ${editStock.symbol}` : 'Add New Stock'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-dark-500 text-slate-400 transition-colors">
                <RiCloseLine size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Company Name *</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                  className={`input ${formErrors.companyName ? 'border-red-500/50' : ''}`}
                  placeholder="e.g. Apple Inc."
                />
                {formErrors.companyName && <p className="text-red-400 text-xs mt-1">{formErrors.companyName}</p>}
              </div>

              {/* Symbol + Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Ticker Symbol *</label>
                  <input
                    type="text"
                    value={form.symbol}
                    onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                    className={`input font-mono ${formErrors.symbol ? 'border-red-500/50' : ''}`}
                    placeholder="e.g. AAPL"
                    maxLength={10}
                  />
                  {formErrors.symbol && <p className="text-red-400 text-xs mt-1">{formErrors.symbol}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.currentPrice}
                    onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))}
                    className={`input font-mono ${formErrors.currentPrice ? 'border-red-500/50' : ''}`}
                    placeholder="0.00"
                  />
                  {formErrors.currentPrice && <p className="text-red-400 text-xs mt-1">{formErrors.currentPrice}</p>}
                </div>
              </div>

              {/* Qty + Sector row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Available Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.availableQuantity}
                    onChange={e => setForm(f => ({ ...f, availableQuantity: e.target.value }))}
                    className={`input font-mono ${formErrors.availableQuantity ? 'border-red-500/50' : ''}`}
                    placeholder="1000"
                  />
                  {formErrors.availableQuantity && <p className="text-red-400 text-xs mt-1">{formErrors.availableQuantity}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Sector</label>
                  <select
                    value={form.sector}
                    onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                    className="input"
                  >
                    <option value="">Select sector</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input resize-none"
                  placeholder="Short company description…"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                    : <><RiSaveLine size={15} />{editStock ? 'Update Stock' : 'Add Stock'}</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ───────────────────────────────── */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, stock: null })}
        onConfirm={handleDelete}
        loading={deleting}
        danger
        title={`Delete ${deleteModal.stock?.symbol}?`}
        message={`This will permanently remove ${deleteModal.stock?.company_name} from the market. All portfolio holdings and transactions referencing this stock will also be deleted. This cannot be undone.`}
        confirmLabel="Delete Stock"
      />
    </div>
  )
}
