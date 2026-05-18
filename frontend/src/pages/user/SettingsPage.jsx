import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  RiSunLine, RiMoonLine, RiUserLine, RiLockLine,
  RiNotificationLine, RiGlobalLine, RiLayoutLine,
  RiSaveLine, RiEyeLine, RiEyeOffLine, RiMoneyDollarCircleLine,
} from 'react-icons/ri'

// Reusable toggle switch
const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none
      ${checked ? 'bg-brand-blue' : 'bg-dark-400 border border-white/10'}`}
  >
    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
)

// Settings card wrapper
const SettingsCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="card p-6 border border-white/5">
    <div className="flex items-start gap-3 mb-5">
      <div className="p-2.5 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
        <Icon className="text-brand-blue text-base" />
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
)

export default function SettingsPage() {
  const { user, setUser, theme, toggleTheme, currency, toggleCurrency, setSidebarCollapsed, sidebarCollapsed } = useAuth()

  const [settings, setSettings] = useState({ notifications_email: 1, notifications_push: 1, language: 'en' })
  const [profile, setProfile]   = useState({ fullName: user?.fullName || '' })
  const [pwForm, setPwForm]     = useState({ current: '', new: '', confirm: '' })
  const [showPw, setShowPw]     = useState({ current: false, new: false, confirm: false })
  const [saving, setSaving]     = useState({})

  // Load settings from server
  useEffect(() => {
    api.get('/settings').then(r => {
      const s = r.data.settings
      setSettings({
        notifications_email: s.notifications_email,
        notifications_push:  s.notifications_push,
        language: s.language || 'en',
      })
    }).catch(console.error)
  }, [])

  const save = async (key, fn) => {
    setSaving(s => ({ ...s, [key]: true }))
    try {
      await fn()
      toast.success('Saved successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(s => ({ ...s, [key]: false }))
    }
  }

  const saveAppearance = () => save('appearance', () =>
    api.put('/settings', {
      theme,
      currency,
      sidebar_collapsed: sidebarCollapsed ? 1 : 0,
    })
  )

  const saveNotifications = () => save('notifications', () =>
    api.put('/settings', {
      notifications_email: settings.notifications_email,
      notifications_push:  settings.notifications_push,
      language: settings.language,
    })
  )

  const saveProfile = () => save('profile', async () => {
    await api.put('/auth/profile', { fullName: profile.fullName })
    const updated = { ...user, fullName: profile.fullName }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  })

  const savePassword = () => save('password', async () => {
    if (pwForm.new !== pwForm.confirm) throw new Error('Passwords do not match.')
    if (pwForm.new.length < 6) throw new Error('Password too short.')
    await api.put('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.new })
    setPwForm({ current: '', new: '', confirm: '' })
  })

  const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'ja', label: 'Japanese' },
  ]

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl">

      {/* ── Appearance ───────────────────────────────────── */}
      <SettingsCard icon={RiSunLine} title="Appearance" subtitle="Customize the look and feel of StockVault">
        <div className="space-y-5">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Theme</p>
              <p className="text-xs text-slate-500 mt-0.5">Switch between dark and light mode</p>
            </div>
            <div className="flex items-center gap-2 bg-dark-600 border border-white/5 rounded-xl p-1">
              {[
                { val: 'dark',  icon: RiMoonLine, label: 'Dark'  },
                { val: 'light', icon: RiSunLine,  label: 'Light' },
              ].map(({ val, icon: Icon, label }) => (
                <button
                  key={val}
                  onClick={toggleTheme}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${theme === val ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Currency</p>
              <p className="text-xs text-slate-500 mt-0.5">All prices will display in selected currency</p>
            </div>
            <div className="flex items-center gap-2 bg-dark-600 border border-white/5 rounded-xl p-1">
              {['USD', 'INR'].map(c => (
                <button
                  key={c}
                  onClick={() => toggleCurrency(c)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${currency === c ? 'bg-brand-blue text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Collapse Sidebar</p>
              <p className="text-xs text-slate-500 mt-0.5">Show only icons in the sidebar</p>
            </div>
            <Toggle checked={sidebarCollapsed} onChange={setSidebarCollapsed} />
          </div>
        </div>

        <button
          onClick={saveAppearance}
          disabled={saving.appearance}
          className="btn-primary mt-5 text-sm flex items-center gap-2"
        >
          <RiSaveLine size={15} />{saving.appearance ? 'Saving…' : 'Save Appearance'}
        </button>
      </SettingsCard>

      {/* ── Profile ──────────────────────────────────────── */}
      <SettingsCard icon={RiUserLine} title="Profile" subtitle="Update your display name and account info">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
              className="input"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="input opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">Email cannot be changed.</p>
          </div>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving.profile}
          className="btn-primary mt-5 text-sm flex items-center gap-2"
        >
          <RiSaveLine size={15} />{saving.profile ? 'Saving…' : 'Save Profile'}
        </button>
      </SettingsCard>

      {/* ── Notifications & Language ─────────────────────── */}
      <SettingsCard icon={RiNotificationLine} title="Notifications & Language" subtitle="Control alerts and your preferred language">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Email Notifications</p>
              <p className="text-xs text-slate-500 mt-0.5">Receive trade confirmations by email</p>
            </div>
            <Toggle
              checked={!!settings.notifications_email}
              onChange={v => setSettings(s => ({ ...s, notifications_email: v ? 1 : 0 }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Push Notifications</p>
              <p className="text-xs text-slate-500 mt-0.5">In-app alerts for price movements</p>
            </div>
            <Toggle
              checked={!!settings.notifications_push}
              onChange={v => setSettings(s => ({ ...s, notifications_push: v ? 1 : 0 }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Language</p>
              <p className="text-xs text-slate-500 mt-0.5">Interface display language</p>
            </div>
            <select
              value={settings.language}
              onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}
              className="bg-dark-600 border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue/50"
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={saveNotifications}
          disabled={saving.notifications}
          className="btn-primary mt-5 text-sm flex items-center gap-2"
        >
          <RiSaveLine size={15} />{saving.notifications ? 'Saving…' : 'Save Preferences'}
        </button>
      </SettingsCard>

      {/* ── Change Password ───────────────────────────────── */}
      <SettingsCard icon={RiLockLine} title="Change Password" subtitle="Update your account password for security">
        <div className="space-y-4">
          {[
            { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'new',     label: 'New Password',     placeholder: 'Min 6 characters' },
            { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPw[key] ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  className="input pr-11"
                  placeholder={placeholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw[key] ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={savePassword}
          disabled={saving.password}
          className="btn-primary mt-5 text-sm flex items-center gap-2"
        >
          <RiLockLine size={15} />{saving.password ? 'Updating…' : 'Update Password'}
        </button>
      </SettingsCard>

      {/* Account info footer */}
      <div className="card p-5 border border-white/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-lg font-bold shrink-0">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-white">{user?.fullName}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-600 mt-0.5">Free Trader Account · Virtual Portfolio</p>
        </div>
      </div>
    </div>
  )
}
