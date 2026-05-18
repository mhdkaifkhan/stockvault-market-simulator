import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RiEyeLine, RiEyeOffLine, RiLineChartLine, RiMailLine, RiLockLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-dark-800 via-dark-700 to-dark-900 flex-col justify-between p-12 border-r border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(59,130,246,0.08),transparent_70%)]" />
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
            <RiLineChartLine className="text-white text-xl" />
          </div>
          <span className="text-white font-bold text-xl">StockVault</span>
        </div>
        {/* Quote */}
        <div className="relative z-10">
          <blockquote className="text-3xl font-light text-white leading-relaxed mb-6">
            "The stock market is a device for transferring money from the impatient to the{' '}
            <span className="text-brand-blue font-medium">patient.</span>"
          </blockquote>
          <p className="text-slate-500 text-sm">— Warren Buffett</p>
        </div>
        {/* Decorative tickers */}
        <div className="relative z-10 space-y-2">
          {[['AAPL','$189.30','+1.99%',true],['TSLA','$245.70','-2.81%',false],['NVDA','$875.40','+3.96%',true]].map(([sym, price, chg, up]) => (
            <div key={sym} className="flex items-center justify-between bg-dark-800/60 border border-white/5 rounded-xl px-4 py-2.5">
              <span className="font-mono text-sm font-medium text-white">{sym}</span>
              <span className="text-sm text-slate-400">{price}</span>
              <span className={`text-xs font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>{chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                <RiLineChartLine className="text-white" />
              </div>
              <span className="text-white font-bold">StockVault</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
            <p className="text-slate-500 text-sm">Enter your credentials to access your portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={`input pl-10 ${errors.email ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`input pl-10 pr-11 ${errors.password ? 'border-red-500/50' : ''}`}
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</span> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-blue hover:text-blue-400 font-medium transition-colors">Create one free</Link>
          </p>

          <div className="mt-8 p-4 bg-dark-700/50 rounded-xl border border-white/5">
            <p className="text-xs text-slate-500 mb-2 font-medium">Admin access</p>
            <Link to="/admin/login" className="text-xs text-brand-purple hover:text-purple-400 transition-colors">→ Admin Panel Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
