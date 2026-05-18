import { useEffect } from 'react'
import { RiCloseLine, RiAlertLine } from 'react-icons/ri'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) { document.addEventListener('keydown', handleKey); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = '' }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card border border-white/10 w-full max-w-md p-6 animate-slide-up shadow-2xl">
        <div className="flex items-start gap-4 mb-5">
          <div className={`p-2 rounded-xl shrink-0 ${danger ? 'bg-red-500/15' : 'bg-brand-blue/15'}`}>
            <RiAlertLine className={`text-xl ${danger ? 'text-red-400' : 'text-brand-blue'}`} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm px-4 py-2" disabled={loading}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50
              ${danger ? 'bg-red-500 hover:bg-red-400 text-white' : 'btn-primary'}`}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
