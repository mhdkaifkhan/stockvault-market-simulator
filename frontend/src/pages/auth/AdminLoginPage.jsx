import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RiShieldLine, RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill all fields.'); return }
    setLoading(true)
    try {
      await adminLogin(form.email, form.password)
      toast.success('Admin access granted')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-purple/15 border border-brand-purple/30 rounded-2xl flex items-center justify-center mb-4">
            <RiShieldLine className="text-brand-purple text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          <p className="text-slate-500 text-sm mt-1">StockVault Administration</p>
        </div>

        <div className="card border border-brand-purple/15 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Admin Email</label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="email" placeholder="admin@stockvault.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input pl-10 pr-11" />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold text-sm bg-brand-purple hover:bg-purple-400 text-white transition-all active:scale-95 disabled:opacity-50 mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Authenticating…</span> : 'Sign In as Admin'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Default: <span className="font-mono text-slate-400">admin@stockvault.com</span> / <span className="font-mono text-slate-400">Admin@123</span>
          </p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          <Link to="/login" className="text-brand-blue hover:text-blue-400 transition-colors">← User Login</Link>
        </p>
      </div>
    </div>
  )
}
