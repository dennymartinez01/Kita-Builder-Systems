'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/credentials', label: 'API Keys & Credentials', icon: KeyRound },
  { href: '/admin/generate', label: 'Generate Site', icon: Zap },
  { href: '/admin/sites', label: 'All Sites', icon: Globe },
  { href: '/admin/templates', label: 'Templates', icon: Layers },
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

  useEffect(() => {
    const stored = sessionStorage.getItem('kita_admin_auth')
    if (stored === 'true') setAuthed(true)
    // Load logo from Supabase Storage
    loadLogo()
    // Listen for logo updates from the settings page
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
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 bg-gray-900 border-b border-gray-800 px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <span className="text-white font-semibold text-sm">KITA Admin</span>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
