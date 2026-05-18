import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RiEyeLine, RiEyeOffLine, RiLineChartLine, RiMailLine, RiLockLine, RiUserLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [show, setShow]       = useState({ p: false, c: false })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.fullName)                         e.fullName = 'Full name is required'
    if (!form.email)                             e.email    = 'Email is required'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm)          e.confirm  = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.fullName, form.email, form.password)
      toast.success('Account created! You get $100,000 to start trading.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ name, label, type = 'text', placeholder, icon: Icon, showToggle, showKey }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input
          type={showKey ? (show[showKey] ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className={`input pl-10 ${showToggle ? 'pr-11' : ''} ${errors[name] ? 'border-red-500/50' : ''}`}
        />
        {showToggle && (
          <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {show[showKey] ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
          </button>
        )}
      </div>
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
            <RiLineChartLine className="text-white text-xl" />
          </div>
          <span className="text-white font-bold text-xl">StockVault</span>
        </div>

        <div className="card border border-white/8 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-6">Start with <span className="text-emerald-400 font-medium">$100,000</span> virtual balance to trade</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field name="fullName"  label="Full Name"        placeholder="John Doe"         icon={RiUserLine} />
            <Field name="email"     label="Email Address"    placeholder="you@example.com"  icon={RiMailLine} type="email" />
            <Field name="password"  label="Password"         placeholder="Min 6 characters" icon={RiLockLine} showToggle showKey="p" />
            <Field name="confirm"   label="Confirm Password" placeholder="Repeat password"  icon={RiLockLine} showToggle showKey="c" />

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</span>
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-blue hover:text-blue-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
