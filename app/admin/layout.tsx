'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  KeyRound,
  Globe,
  Layers,
  BookOpen,
  LogOut,
  Menu,
  Settings,
  Zap,
  TrendingUp,
  Search,
  Users,
  Activity,
  Bell,
  CheckCheck,
  X,
} from 'lucide-react'
import { CATEGORY_ICONS, SEVERITY_COLORS } from '@/lib/events'
import type { AdminNotification } from '@/lib/notifications'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/credentials', label: 'API Keys & Credentials', icon: KeyRound },
  { href: '/admin/generate', label: 'Generate Site', icon: Zap },
  { href: '/admin/sites', label: 'All Sites', icon: Globe },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/admin/events',         label: 'Activity & Events', icon: Activity },
  { href: '/admin/notifications',  label: 'Notifications',     icon: Bell },
  { href: '/admin/templates', label: 'Templates', icon: Layers },
  { href: '/audit', label: 'Website Audit', icon: Search },
  { href: '/audit-pitch', label: 'Audit Pitch ↗', icon: Globe },
  { href: '/admin/docs', label: 'Documentation', icon: BookOpen },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/pitch', label: 'Pitch Page ↗', icon: Globe },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Notification bell state
  const [unreadCount, setUnreadCount]         = useState(0)
  const [bellOpen, setBellOpen]               = useState(false)
  const [notifications, setNotifications]     = useState<AdminNotification[]>([])
  const [notifLoading, setNotifLoading]       = useState(false)
  const bellRef                               = useRef<HTMLDivElement>(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res  = await fetch('/api/notifications?limit=1')
      const data = await res.json()
      if (res.ok) setUnreadCount(data.unread_count ?? 0)
    } catch { /* silent */ }
  }, [])

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true)
    try {
      const res  = await fetch('/api/notifications?limit=10')
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unread_count ?? 0)
      }
    } finally {
      setNotifLoading(false)
    }
  }, [])

  async function handleMarkAllRead() {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read' }),
    })
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
  }

  async function handleMarkRead(id: string) {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Close bell dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem('kita_admin_auth')
    if (stored === 'true') {
      setAuthed(true)
      fetchUnreadCount()
    }
    loadLogo()
    window.addEventListener('kita-logo-updated', (e: any) => {
      setLogoUrl(e.detail.url + '?t=' + Date.now())
    })
  }, [])

  async function loadLogo() {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      // List files — reliable check vs HEAD fetch
      const { data: files } = await client.storage
        .from('kita-assets')
        .list('brand', { limit: 10 })

      const logoFile = files?.find(f => f.name.startsWith('kita-logo'))
      if (!logoFile) return

      const { data: urlData } = client.storage
        .from('kita-assets')
        .getPublicUrl(`brand/${logoFile.name}`)

      setLogoUrl(urlData.publicUrl + '?t=' + Date.now())
    } catch {
      // No logo yet — use default
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    // PIN is checked client-side for local dev simplicity
    // In production: replace with a real server-side auth check
    const adminPin = process.env.NEXT_PUBLIC_ADMIN_PIN || 'kita2024'
    if (pin === adminPin) {
      sessionStorage.setItem('kita_admin_auth', 'true')
      setAuthed(true)
      setError('')
    } else {
      setError('Wrong PIN. Try again.')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('kita_admin_auth')
    setAuthed(false)
    setPin('')
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              {logoUrl ? (
                <img src={logoUrl} alt="KITA Systems" className="h-10 object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Zap size={18} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-xl">KITA Systems</span>
                </>
              )}
            </div>
            <p className="text-gray-500 text-sm">Admin CMS — Internal Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Admin PIN</label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter your admin PIN"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 text-sm transition"
            >
              Enter Admin Panel
            </button>
          </form>

          <p className="text-gray-600 text-xs text-center mt-6">
            Default PIN: <span className="text-gray-500 font-mono">kita2024</span><br />
            Change via <span className="font-mono">NEXT_PUBLIC_ADMIN_PIN</span> in .env.local
          </p>
        </div>
      </div>
    )
  }

  function isActive(item: typeof NAV_ITEMS[0]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-30
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:flex-col
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          {logoUrl ? (
            <img src={logoUrl} alt="KITA Systems" className="h-8 object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">KITA Systems</div>
                <div className="text-gray-500 text-xs">Admin Panel</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-gray-800 w-full transition"
          >
            <LogOut size={16} />
            Log Out
          </button>
          <p className="text-gray-700 text-xs px-3 mt-2">
            From Struggle to Booked. ✊
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header — mobile hamburger + notification bell */}
        <header className="flex items-center justify-between bg-gray-900 border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white lg:hidden">
              <Menu size={20} />
            </button>
            <span className="text-white font-semibold text-sm lg:hidden">KITA Admin</span>
          </div>

          {/* Notification bell */}
          <div className="relative ml-auto" ref={bellRef}>
            <button
              onClick={() => {
                setBellOpen(prev => {
                  if (!prev) fetchNotifications()
                  return !prev
                })
              }}
              className="relative p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {bellOpen && (
              <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Bell size={13} className="text-gray-400" />
                    <span className="text-white text-xs font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-gray-500 hover:text-white text-xs transition px-2 py-1 rounded hover:bg-gray-800"
                        title="Mark all as read"
                      >
                        <CheckCheck size={12} />
                        All read
                      </button>
                    )}
                    <button
                      onClick={() => setBellOpen(false)}
                      className="text-gray-600 hover:text-white p-1 rounded transition"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                <div className="max-h-80 overflow-y-auto">
                  {notifLoading ? (
                    <div className="text-center py-8 text-gray-600 text-xs">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 text-xs">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => !n.read_at && handleMarkRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800/50 last:border-0 cursor-pointer hover:bg-gray-800/40 transition ${!n.read_at ? 'bg-blue-950/20' : ''}`}
                      >
                        <span className="text-base shrink-0 mt-0.5">{CATEGORY_ICONS[n.category] ?? '⚙️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-200 text-xs leading-relaxed line-clamp-2">{n.summary}</p>
                          <p className="text-gray-600 text-xs mt-0.5">
                            {new Date(n.created_at).toLocaleString('en-AU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.read_at && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-gray-800">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setBellOpen(false)}
                    className="text-blue-400 hover:text-blue-300 text-xs transition"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
