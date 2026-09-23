'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Site, Service, Booking, Staff } from '@/types/database'
import AgentChat from '@/components/AgentChat'
import {
  CalendarCheck, Wrench, ExternalLink, CheckCircle,
  XCircle, Plus, Trash2, Loader2, Lock, Zap,
  Users, Clock, FileText, Save,
} from 'lucide-react'

type Tab = 'bookings' | 'services' | 'staff' | 'hours' | 'about' | 'ai'

interface PageProps {
  params: Promise<{ slug: string }>
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_HOURS: Record<string, { open: string; close: string; closed: boolean }> = {
  Monday:    { open: '09:00', close: '17:00', closed: false },
  Tuesday:   { open: '09:00', close: '17:00', closed: false },
  Wednesday: { open: '09:00', close: '17:00', closed: false },
  Thursday:  { open: '09:00', close: '17:00', closed: false },
  Friday:    { open: '09:00', close: '17:00', closed: false },
  Saturday:  { open: '09:00', close: '14:00', closed: false },
  Sunday:    { open: '09:00', close: '14:00', closed: true },
}

export default function OwnerDashboard({ params }: PageProps) {
  const [slug, setSlug] = useState<string | null>(null)
  const [site, setSite] = useState<Site | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tab, setTab] = useState<Tab>('bookings')
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState('')

  // Hours state — loaded from theme_json or defaults
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [hoursSaved, setHoursSaved] = useState(false)

  // About state
  const [aboutTitle, setAboutTitle] = useState('')
  const [aboutBody, setAboutBody] = useState('')
  const [aboutSaved, setAboutSaved] = useState(false)

  useEffect(() => {
    params.then(p => setSlug(p.slug))
  }, [params])

  const loadData = useCallback(async (siteData: Site) => {
    const [svcsRes, bksRes, staffRes] = await Promise.all([
      supabase.from('services').select('*').eq('site_id', siteData.id).order('created_at'),
      supabase.from('bookings').select('*').eq('site_id', siteData.id).order('booking_date', { ascending: false }),
      supabase.from('staff').select('*').eq('site_id', siteData.id).order('created_at'),
    ])
    setServices(svcsRes.data || [])
    setBookings(bksRes.data || [])
    setStaffList(staffRes.data || [])

    // Load hours from theme_json if saved previously
    const themeJson = siteData.theme_json as any
    if (themeJson?.business_hours) {
      setHours(themeJson.business_hours)
    }

    // Load about section
    const aboutSection = themeJson?.sections?.find((s: any) => s.type === 'about')
    if (aboutSection) {
      setAboutTitle(aboutSection.data?.title || '')
      setAboutBody(aboutSection.data?.body || '')
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!slug) return
    setLoading(true)
    setPinError('')
    const { data: siteData } = await supabase.from('sites').select('*').eq('slug', slug).single()
    setLoading(false)
    if (!siteData) { setPinError('Site not found.'); return }
    if (siteData.owner_pin !== pin) { setPinError('Wrong PIN. Please try again.'); return }
    setSite(siteData)
    await loadData(siteData)
    setAuthed(true)
  }

  // ─── SERVICES ─────────────────────────────────────────────────
  async function updateService(id: string, field: keyof Service, value: string | number) {
    await supabase.from('services').update({ [field]: value }).eq('id', id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  async function addService() {
    if (!site) return
    const { data } = await supabase.from('services').insert({
      site_id: site.id, name: 'New Service', price: 100, duration_minutes: 60,
    }).select().single()
    if (data) setServices(prev => [...prev, data])
  }

  async function deleteService(id: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  // ─── STAFF ────────────────────────────────────────────────────
  async function updateStaff(id: string, field: keyof Staff, value: string) {
    await supabase.from('staff').update({ [field]: value }).eq('id', id)
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  async function addStaff() {
    if (!site) return
    const { data } = await supabase.from('staff').insert({
      site_id: site.id, name: 'New Team Member', role: 'Staff',
    }).select().single()
    if (data) setStaffList(prev => [...prev, data])
  }

  async function deleteStaff(id: string) {
    if (!confirm('Remove this team member?')) return
    await supabase.from('staff').delete().eq('id', id)
    setStaffList(prev => prev.filter(s => s.id !== id))
  }

  // ─── HOURS ────────────────────────────────────────────────────
  function updateHour(day: string, field: 'open' | 'close' | 'closed', value: string | boolean) {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  async function saveHours() {
    if (!site) return
    const themeJson = site.theme_json as any
    const updated = { ...themeJson, business_hours: hours }
    await supabase.from('sites').update({ theme_json: updated }).eq('id', site.id)
    setSite(prev => prev ? { ...prev, theme_json: updated } : prev)
    setHoursSaved(true)
    setTimeout(() => setHoursSaved(false), 2500)
  }

  // ─── ABOUT ────────────────────────────────────────────────────
  async function saveAbout() {
    if (!site) return
    const themeJson = site.theme_json as any
    const updated = {
      ...themeJson,
      sections: themeJson.sections.map((s: any) =>
        s.type === 'about'
          ? { ...s, data: { title: aboutTitle, body: aboutBody } }
          : s
      ),
    }
    await supabase.from('sites').update({ theme_json: updated }).eq('id', site.id)
    setSite(prev => prev ? { ...prev, theme_json: updated } : prev)
    setAboutSaved(true)
    setTimeout(() => setAboutSaved(false), 2500)
  }

  // ─── BOOKINGS ─────────────────────────────────────────────────
  async function updateBookingStatus(id: string, status: Booking['status']) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const primaryColor = (site?.theme_json as any)?.theme?.primary || '#1A1A2E'
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length

  // ─── PIN GATE ─────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-lg">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
              <Lock size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-gray-900 text-lg">
              {slug ? slug.split('-').slice(0, -1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Owner Dashboard'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Enter your PIN to manage your site</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password" value={pin} onChange={e => setPin(e.target.value)}
              placeholder="PIN" maxLength={8} autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-gray-400"
            />
            {pinError && <p className="text-red-500 text-xs text-center">{pinError}</p>}
            <button type="submit" disabled={loading || !pin}
              className="w-full text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Enter Dashboard'}
            </button>
          </form>
          <p className="text-gray-400 text-xs text-center mt-4">Default PIN: <span className="font-mono">1234</span></p>
        </div>
      </div>
    )
  }

  // ─── DASHBOARD ────────────────────────────────────────────────
  const TABS = [
    { id: 'bookings' as Tab, label: 'Bookings', icon: CalendarCheck, badge: pendingBookings > 0 ? pendingBookings : null },
    { id: 'services' as Tab, label: 'Services', icon: Wrench, badge: null },
    { id: 'staff' as Tab, label: 'Staff', icon: Users, badge: null },
    { id: 'hours' as Tab, label: 'Hours', icon: Clock, badge: null },
    { id: 'about' as Tab, label: 'About', icon: FileText, badge: null },
    { id: 'ai' as Tab, label: 'AI Assistant', icon: Zap, badge: null },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 py-5" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">{site?.business_name}</h1>
            <p className="text-white/60 text-sm">Owner Dashboard</p>
          </div>
          <a href={`/${slug}`} target="_blank" className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition">
            View Site <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Pending', value: pendingBookings, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Confirmed', value: confirmedBookings, color: 'text-green-600 bg-green-50' },
            { label: 'Services', value: services.length, color: 'text-blue-600 bg-blue-50' },
            { label: 'Staff', value: staffList.length, color: 'text-purple-600 bg-purple-50' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-4 text-center ${stat.color}`}>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium mt-0.5 opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="overflow-x-auto mb-5">
          <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl w-fit min-w-full sm:min-w-0">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    tab === t.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={13} />
                  {t.label}
                  {t.badge && (
                    <span className="bg-yellow-400 text-yellow-900 text-xs rounded-full px-1.5 py-0.5 font-bold leading-none">
                      {t.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── BOOKINGS ── */}
        {tab === 'bookings' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CalendarCheck size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No bookings yet.</p>
                <a href={`/${slug}`} target="_blank" className="text-xs mt-2 inline-block hover:underline" style={{ color: primaryColor }}>
                  Share your site to get bookings →
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <div key={b.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{b.customer_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            b.status === 'confirmed' ? 'bg-green-100 text-green-700'
                            : b.status === 'cancelled' ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}>{b.status}</span>
                        </div>
                        <p className="text-gray-600 text-xs mt-1"><strong>{b.service_name}</strong> · {b.booking_date} at {b.booking_time}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          📞 {b.customer_phone}
                          {b.car_model && <> · 🚗 {b.car_model}</>}
                          {b.pet_name && <> · 🐾 {b.pet_name}</>}
                          {b.notes && <> · 💬 {b.notes}</>}
                        </p>
                      </div>
                      {b.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Confirm">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Cancel">
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SERVICES ── */}
        {tab === 'services' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Changes save instantly to your live site.</p>
              <button onClick={addService} className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition" style={{ backgroundColor: primaryColor }}>
                <Plus size={14} /> Add Service
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {services.map(s => (
                <div key={s.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <input value={s.name} onChange={e => updateService(s.id, 'name', e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 bg-transparent focus:outline-none focus:bg-gray-50 rounded px-2 py-1 -mx-2" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-400 text-xs">$</span>
                    <input type="number" value={s.price} onChange={e => updateService(s.id, 'price', parseFloat(e.target.value))}
                      className="w-20 text-sm text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none" />
                    <span className="text-gray-400 text-xs">min</span>
                    <input type="number" value={s.duration_minutes} onChange={e => updateService(s.id, 'duration_minutes', parseInt(e.target.value))}
                      className="w-16 text-sm text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none" />
                    <button onClick={() => deleteService(s.id)} className="text-gray-300 hover:text-red-400 transition p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No services yet. Add your first one.</p>
              )}
            </div>
          </div>
        )}

        {/* ── STAFF ── */}
        {tab === 'staff' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Your team shown on the public site.</p>
              <button onClick={addStaff} className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition" style={{ backgroundColor: primaryColor }}>
                <Plus size={14} /> Add Member
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {staffList.map(s => (
                <div key={s.id} className="p-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3 min-w-0">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Name</label>
                      <input value={s.name} onChange={e => updateStaff(s.id, 'name', e.target.value)}
                        className="w-full text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Role / Title</label>
                      <input value={s.role} onChange={e => updateStaff(s.id, 'role', e.target.value)}
                        className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                    </div>
                  </div>
                  <button onClick={() => deleteStaff(s.id)} className="text-gray-300 hover:text-red-400 transition p-1 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {staffList.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No team members yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ── HOURS ── */}
        {tab === 'hours' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Set your opening hours. Displayed on your site.</p>
              <button
                onClick={saveHours}
                className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition"
                style={{ backgroundColor: hoursSaved ? '#16a34a' : primaryColor }}
              >
                {hoursSaved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Hours</>}
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {DAYS.map(day => (
                <div key={day} className="px-4 py-3 flex items-center gap-4">
                  <div className="w-24 shrink-0">
                    <span className="text-sm font-medium text-gray-900">{day}</span>
                  </div>
                  <label className="flex items-center gap-2 shrink-0">
                    <div
                      onClick={() => updateHour(day, 'closed', !hours[day]?.closed)}
                      className={`w-9 h-5 rounded-full cursor-pointer transition-colors relative ${hours[day]?.closed ? 'bg-gray-200' : 'bg-green-500'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hours[day]?.closed ? 'left-0.5' : 'left-4'}`} />
                    </div>
                    <span className="text-xs text-gray-500">{hours[day]?.closed ? 'Closed' : 'Open'}</span>
                  </label>
                  {!hours[day]?.closed && (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={hours[day]?.open || '09:00'}
                        onChange={e => updateHour(day, 'open', e.target.value)}
                        className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-400" />
                      <span className="text-gray-400 text-xs">to</span>
                      <input type="time" value={hours[day]?.close || '17:00'}
                        onChange={e => updateHour(day, 'close', e.target.value)}
                        className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-400" />
                    </div>
                  )}
                  {hours[day]?.closed && (
                    <span className="text-gray-300 text-sm italic">Closed all day</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ABOUT ── */}
        {tab === 'about' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Edit your About section shown on the public site.</p>
              <button
                onClick={saveAbout}
                className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition"
                style={{ backgroundColor: aboutSaved ? '#16a34a' : primaryColor }}
              >
                {aboutSaved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save</>}
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1.5">Section Title</label>
                <input
                  value={aboutTitle}
                  onChange={e => setAboutTitle(e.target.value)}
                  placeholder="e.g. About Edison Barber Shop"
                  className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1.5">About Text</label>
                <textarea
                  value={aboutBody}
                  onChange={e => setAboutBody(e.target.value)}
                  rows={6}
                  placeholder="Describe your business — who you are, what you do, and why customers love you..."
                  className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 resize-none leading-relaxed"
                />
                <p className="text-gray-400 text-xs mt-1">{aboutBody.length} characters</p>
              </div>
              {/* Live preview */}
              {(aboutTitle || aboutBody) && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Preview</p>
                  <div className="rounded-xl p-5 text-center" style={{ backgroundColor: (site?.theme_json as any)?.theme?.primary + '15' }}>
                    {aboutTitle && <h3 className="font-bold text-gray-900 text-lg mb-2">{aboutTitle}</h3>}
                    {aboutBody && <p className="text-gray-600 text-sm leading-relaxed">{aboutBody}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AI ASSISTANT ── */}
        {tab === 'ai' && site && (
          <div>
            <p className="text-gray-500 text-sm mb-4">
              Tell the AI what to change on your site in plain English. Changes apply instantly.
            </p>
            <AgentChat siteId={site.id} primaryColor={primaryColor} businessName={site.business_name} />
          </div>
        )}
      </div>
    </div>
  )
}
