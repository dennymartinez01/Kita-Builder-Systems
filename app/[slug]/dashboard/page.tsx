'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Site, Service, Booking, Staff } from '@/types/database'
import AgentChat from '@/components/AgentChat'
import BlockedDatesTab from '@/components/BlockedDatesTab'
import CustomersTab from '@/components/CustomersTab'
import CouponsTab from '@/components/CouponsTab'
import InquiriesTab from '@/components/InquiriesTab'
import CalendarTab from '@/components/CalendarTab'
import ImpersonationBanner from '@/components/ImpersonationBanner'
import { getImpersonationSession } from '@/lib/impersonation'
import RankBadge from '@/components/RankBadge'
import { getWhiteLabelConfig } from '@/lib/whitelabel'
import {
  CalendarCheck, Wrench, ExternalLink, CheckCircle,
  XCircle, Plus, Trash2, Loader2, Lock, Zap,
  Users, Clock, FileText, Save, KeyRound, Image,
  Star, Upload, X, Download, BarChart2, Ban, Tag, MessageSquare, Calendar,
} from 'lucide-react'

type Tab = 'bookings' | 'services' | 'staff' | 'hours' | 'about' | 'testimonials' | 'gallery' | 'settings' | 'analytics' | 'blocked' | 'ai' | 'customers' | 'coupons' | 'inquiries' | 'calendar'

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

  // Testimonials state
  const [testimonials, setTestimonials] = useState<{ name: string; text: string; rating: number }[]>([])
  const [testimonialsSaved, setTestimonialsSaved] = useState(false)

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [gallerySaved, setGallerySaved] = useState(false)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Logo state
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // PIN change state
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinSaving, setPinSaving] = useState(false)
  const [pinMsg, setPinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Analytics state
  const [pageViews, setPageViews] = useState<{ date: string; count: number }[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [sourceBreakdown, setSourceBreakdown] = useState<{ source: string; count: number }[]>([])
  const [geoBreakdown, setGeoBreakdown] = useState<{ country: string; count: number; pct: number }[]>([])

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

    // Load analytics in background
    loadAnalytics(siteData.id)

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

    // Load testimonials
    const testimonialsSection = themeJson?.sections?.find((s: any) => s.type === 'testimonials')
    if (testimonialsSection?.data?.items) {
      setTestimonials(testimonialsSection.data.items)
    }

    // Load gallery
    const gallerySection = themeJson?.sections?.find((s: any) => s.type === 'gallery')
    if (gallerySection?.data?.images) {
      setGalleryImages(gallerySection.data.images)
    }

    // Load logo
    if (themeJson?.logo_url) {
      setLogoUrl(themeJson.logo_url)
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

  // ─── TESTIMONIALS ─────────────────────────────────────────────
  async function saveTestimonials() {
    if (!site) return
    const themeJson = site.theme_json as any
    const updated = {
      ...themeJson,
      sections: themeJson.sections.map((s: any) =>
        s.type === 'testimonials' ? { ...s, data: { items: testimonials } } : s
      ),
    }
    // If no testimonials section exists, add one
    if (!themeJson.sections.find((s: any) => s.type === 'testimonials')) {
      updated.sections = [...themeJson.sections, { type: 'testimonials', data: { items: testimonials } }]
    }
    await supabase.from('sites').update({ theme_json: updated }).eq('id', site.id)
    setSite(prev => prev ? { ...prev, theme_json: updated } : prev)
    setTestimonialsSaved(true)
    setTimeout(() => setTestimonialsSaved(false), 2500)
  }

  function addTestimonial() {
    setTestimonials(prev => [...prev, { name: '', text: '', rating: 5 }])
  }

  function updateTestimonial(i: number, field: string, value: string | number) {
    setTestimonials(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t))
  }

  function removeTestimonial(i: number) {
    setTestimonials(prev => prev.filter((_, idx) => idx !== i))
  }

  // ─── GALLERY ──────────────────────────────────────────────────
  async function handleGalleryUpload(files: FileList | null) {
    if (!files || !site) return
    setGalleryUploading(true)
    const newUrls: string[] = []
    for (const file of Array.from(files)) {
      if (file.size > 2 * 1024 * 1024) continue // skip >2MB
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', `gallery/${site.id}`)
      const res = await fetch('/api/upload-logo', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) newUrls.push(data.url)
    }
    const updated = [...galleryImages, ...newUrls]
    setGalleryImages(updated)
    await saveGallery(updated)
    setGalleryUploading(false)
  }

  async function saveGallery(images: string[]) {
    if (!site) return
    const themeJson = site.theme_json as any
    const hasGallery = themeJson.sections.find((s: any) => s.type === 'gallery')
    const updated = {
      ...themeJson,
      sections: hasGallery
        ? themeJson.sections.map((s: any) => s.type === 'gallery' ? { ...s, data: { images } } : s)
        : [...themeJson.sections, { type: 'gallery', data: { images } }],
    }
    await supabase.from('sites').update({ theme_json: updated }).eq('id', site.id)
    setSite(prev => prev ? { ...prev, theme_json: updated } : prev)
    setGallerySaved(true)
    setTimeout(() => setGallerySaved(false), 2500)
  }

  async function removeGalleryImage(url: string) {
    const updated = galleryImages.filter(u => u !== url)
    setGalleryImages(updated)
    await saveGallery(updated)
  }

  // ─── LOGO UPLOAD ──────────────────────────────────────────────
  async function handleLogoUpload(file: File | null) {
    if (!file || !site) return
    setLogoUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload-logo', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) {
      setLogoUrl(data.url)
      const themeJson = site.theme_json as any
      const updated = { ...themeJson, logo_url: data.url }
      await supabase.from('sites').update({ theme_json: updated }).eq('id', site.id)
      setSite(prev => prev ? { ...prev, theme_json: updated } : prev)
    }
    setLogoUploading(false)
  }

  // ─── PIN CHANGE ───────────────────────────────────────────────
  async function handlePinChange(e: React.FormEvent) {
    e.preventDefault()
    setPinMsg(null)
    if (newPin.length < 4) { setPinMsg({ type: 'error', text: 'PIN must be at least 4 characters.' }); return }
    if (newPin !== confirmPin) { setPinMsg({ type: 'error', text: 'PINs do not match.' }); return }
    setPinSaving(true)
    const { error } = await supabase.from('sites').update({ owner_pin: newPin }).eq('id', site!.id)
    setPinSaving(false)
    if (error) {
      setPinMsg({ type: 'error', text: 'Failed to save PIN. Try again.' })
    } else {
      setSite(prev => prev ? { ...prev, owner_pin: newPin } : prev)
      setNewPin('')
      setConfirmPin('')
      setPinMsg({ type: 'success', text: 'PIN updated successfully!' })
    }
  }

  // ─── ANALYTICS ────────────────────────────────────────────────
  async function loadAnalytics(siteId: string) {
    setAnalyticsLoading(true)
    // Get views for last 14 days
    const since = new Date()
    since.setDate(since.getDate() - 13)
    const { data: views } = await supabase
      .from('page_views')
      .select('viewed_at')
      .eq('site_id', siteId)
      .gte('viewed_at', since.toISOString())
      .order('viewed_at')

    // Group by date
    const counts: Record<string, number> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      counts[d.toISOString().split('T')[0]] = 0
    }
    views?.forEach(v => {
      const date = v.viewed_at.split('T')[0]
      if (counts[date] !== undefined) counts[date]++
    })

    setPageViews(Object.entries(counts).map(([date, count]) => ({ date, count })))

    // Attribution source breakdown — bookings with utm_source
    const { data: attributed } = await supabase
      .from('bookings')
      .select('utm_source')
      .eq('site_id', siteId)
      .not('utm_source', 'is', null)

    if (attributed && attributed.length > 0) {
      const srcCounts: Record<string, number> = {}
      attributed.forEach((b: any) => {
        const src = b.utm_source || 'direct'
        srcCounts[src] = (srcCounts[src] || 0) + 1
      })
      const sorted = Object.entries(srcCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
      setSourceBreakdown(sorted)
    } else {
      setSourceBreakdown([])
    }

    // Geographic breakdown from page_views country column
    const { data: geoData } = await supabase
      .from('page_views')
      .select('country')
      .eq('site_id', siteId)
      .not('country', 'is', null)
      .gte('viewed_at', since.toISOString())

    if (geoData && geoData.length > 0) {
      const geoCounts: Record<string, number> = {}
      geoData.forEach((v: any) => {
        const c = v.country || 'Unknown'
        geoCounts[c] = (geoCounts[c] || 0) + 1
      })
      const total = geoData.length
      const sorted = Object.entries(geoCounts)
        .map(([country, count]) => ({ country, count, pct: Math.round((count / total) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // top 8 countries
      setGeoBreakdown(sorted)
    } else {
      setGeoBreakdown([])
    }

    setAnalyticsLoading(false)
  }

  // ─── BOOKINGS ─────────────────────────────────────────────────
  async function updateBookingStatus(id: string, status: Booking['status']) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const primaryColor = (site?.theme_json as any)?.theme?.primary || '#1A1A2E'
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const siteTimezone = (site as any)?.timezone || 'UTC'
  const wl = getWhiteLabelConfig()

  // ─── IMPERSONATION BYPASS ─────────────────────────────────────
  // If admin is impersonating this site, auto-bypass PIN gate
  useEffect(() => {
    if (authed || !slug) return
    const session = getImpersonationSession()
    if (session && session.siteSlug === slug) {
      // Load site data and authenticate without PIN
      supabase.from('sites').select('*').eq('slug', slug).single().then(({ data: siteData }) => {
        if (siteData) {
          setSite(siteData)
          loadData(siteData)
          setAuthed(true)
        }
      })
    }
  }, [slug, authed]) // eslint-disable-line

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
          <p className="text-gray-400 text-xs text-center mt-4">
            Default PIN: <span className="font-mono">1234</span>
            {wl.enabled && (
              <span className="block text-gray-600 mt-1">Powered by {wl.agencyName}</span>
            )}
          </p>
        </div>
      </div>
    )
  }

  // ─── DASHBOARD ────────────────────────────────────────────────
  const TABS = [    { id: 'bookings' as Tab, label: 'Bookings', icon: CalendarCheck, badge: pendingBookings > 0 ? pendingBookings : null },
    { id: 'calendar' as Tab,  label: 'Calendar',  icon: Calendar,      badge: null },
    { id: 'services' as Tab, label: 'Services', icon: Wrench, badge: null },
    { id: 'staff' as Tab, label: 'Staff', icon: Users, badge: null },
    { id: 'hours' as Tab, label: 'Hours', icon: Clock, badge: null },
    { id: 'about' as Tab, label: 'About', icon: FileText, badge: null },
    { id: 'testimonials' as Tab, label: 'Reviews', icon: Star, badge: null },
    { id: 'gallery' as Tab, label: 'Gallery', icon: Image, badge: null },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart2, badge: null },
    { id: 'customers' as Tab, label: 'Customers', icon: Users, badge: null },
    { id: 'coupons' as Tab,    label: 'Coupons',    icon: Tag,          badge: null },
    { id: 'inquiries' as Tab,  label: 'Inquiries',  icon: MessageSquare, badge: null },
    { id: 'blocked' as Tab,    label: 'Block Dates', icon: Ban,          badge: null },
    { id: 'settings' as Tab, label: 'Settings', icon: KeyRound, badge: null },
    { id: 'ai' as Tab, label: 'AI Assistant', icon: Zap, badge: null },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin impersonation banner — only shown when admin is viewing as client */}
      <ImpersonationBanner />
      {/* Header */}
      <div className="px-6 py-5" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">{site?.business_name}</h1>
            <p className="text-white/60 text-sm">
              {wl.enabled ? wl.agencyName : 'Owner Dashboard'}
            </p>
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

        {/* Business Rank — compact badge shown below stats */}
        {site && (
          <div className="mb-5">
            <RankBadge siteId={site.id} compact={false} darkMode={false} primaryColor={primaryColor} />
          </div>
        )}

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
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <p className="text-xs text-gray-400">{bookings.length} total bookings</p>
              {bookings.length > 0 && (
                <button
                  onClick={() => {
                    const headers = ['Customer', 'Phone', 'Service', 'Staff', 'Date', 'Time', 'Status', 'Notes']
                    const rows = bookings.map(b => [b.customer_name, b.customer_phone, b.service_name, b.staff_name || '', b.booking_date, b.booking_time, b.status, b.notes || ''])
                    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `bookings-${slug}-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50 transition"
                >
                  <Download size={12} /> Export CSV
                </button>
              )}
            </div>
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
                          {b.staff_name && <> · 👤 {b.staff_name}</>}
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

        {/* ── TESTIMONIALS ── */}
        {tab === 'testimonials' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Customer reviews shown on your public site.</p>
              <div className="flex gap-2">
                <button onClick={addTestimonial} className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition" style={{ backgroundColor: primaryColor }}>
                  <Plus size={14} /> Add Review
                </button>
                <button
                  onClick={saveTestimonials}
                  className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition"
                  style={{ backgroundColor: testimonialsSaved ? '#16a34a' : '#374151' }}
                >
                  {testimonialsSaved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save</>}
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {testimonials.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">No reviews yet. Add your first one.</p>
              )}
              {testimonials.map((t, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Customer Name</label>
                        <input value={t.name} onChange={e => updateTestimonial(i, 'name', e.target.value)}
                          placeholder="e.g. Sarah M."
                          className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Rating</label>
                        <div className="flex gap-1 mt-1.5">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} type="button" onClick={() => updateTestimonial(i, 'rating', star)}
                              className={`text-xl transition ${star <= t.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeTestimonial(i)} className="text-gray-300 hover:text-red-400 transition p-1 shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Review Text</label>
                    <textarea value={t.text} onChange={e => updateTestimonial(i, 'text', e.target.value)}
                      rows={2} placeholder="What did they say about your business?"
                      className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GALLERY ── */}
        {tab === 'gallery' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Photos shown on your public site. Max 2MB per image.</p>
              <button onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition"
                style={{ backgroundColor: primaryColor }}
                disabled={galleryUploading}
              >
                {galleryUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {galleryUploading ? 'Uploading...' : 'Upload Photos'}
              </button>
              <input ref={galleryInputRef} type="file" multiple accept="image/*"
                className="hidden" onChange={e => handleGalleryUpload(e.target.files)} />
            </div>
            <div className="p-4">
              {galleryImages.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition"
                  onClick={() => galleryInputRef.current?.click()}>
                  <Image size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-400 text-sm">Click to upload photos</p>
                  <p className="text-gray-300 text-xs mt-1">PNG, JPG, WebP · Max 2MB each</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                      <img src={url} alt={`Gallery ${i+1}`} className="w-full h-full object-cover" />
                      <button onClick={() => removeGalleryImage(url)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-gray-400 transition">
                    <Plus size={20} className="text-gray-300" />
                  </div>
                </div>
              )}
              {gallerySaved && <p className="text-green-600 text-xs text-center mt-3">✅ Gallery saved!</p>}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const now = new Date()
                const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
                const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
                const viewsThisWeek = pageViews.filter(v => new Date(v.date) >= weekAgo).reduce((a, v) => a + v.count, 0)
                const viewsLastWeek = pageViews.filter(v => new Date(v.date) >= twoWeeksAgo && new Date(v.date) < weekAgo).reduce((a, v) => a + v.count, 0)
                const bookingsThisWeek = bookings.filter(b => new Date(b.booking_date) >= weekAgo).length
                const bookingsLastWeek = bookings.filter(b => new Date(b.booking_date) >= twoWeeksAgo && new Date(b.booking_date) < weekAgo).length
                const totalViews = pageViews.reduce((a, v) => a + v.count, 0)
                const viewTrend = viewsLastWeek > 0 ? Math.round(((viewsThisWeek - viewsLastWeek) / viewsLastWeek) * 100) : null

                return [
                  { label: 'Views This Week', value: viewsThisWeek, trend: viewTrend, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Views Last Week', value: viewsLastWeek, trend: null, color: 'text-gray-600 bg-gray-50' },
                  { label: 'Bookings This Week', value: bookingsThisWeek, trend: null, color: 'text-green-600 bg-green-50' },
                  { label: 'Total Views (14d)', value: totalViews, trend: null, color: 'text-purple-600 bg-purple-50' },
                ].map(stat => (
                  <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
                    <div className="text-2xl font-bold">{analyticsLoading ? '…' : stat.value}</div>
                    <div className="text-xs font-medium mt-0.5 opacity-70">{stat.label}</div>
                    {stat.trend !== null && (
                      <div className={`text-xs mt-1 font-semibold ${stat.trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {stat.trend >= 0 ? '↑' : '↓'} {Math.abs(stat.trend)}% vs last week
                      </div>
                    )}
                  </div>
                ))
              })()}
            </div>

            {/* Page views bar chart — last 14 days */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Page Views — Last 14 Days</h3>
                <BarChart2 size={16} className="text-gray-400" />
              </div>
              {analyticsLoading ? (
                <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
              ) : pageViews.every(v => v.count === 0) ? (
                <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                  No views yet — share your site link to start tracking visitors.
                </div>
              ) : (
                <div className="flex items-end gap-1 h-32">
                  {pageViews.map((v, i) => {
                    const max = Math.max(...pageViews.map(x => x.count), 1)
                    const height = Math.max((v.count / max) * 100, v.count > 0 ? 4 : 0)
                    const isToday = v.date === new Date().toISOString().split('T')[0]
                    const label = new Date(v.date + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })
                    return (
                      <div key={v.date} className="flex-1 flex flex-col items-center gap-1" title={`${label}: ${v.count} views`}>
                        <span className="text-gray-500 text-[9px]">{v.count > 0 ? v.count : ''}</span>
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${height}%`,
                            minHeight: v.count > 0 ? '4px' : '2px',
                            backgroundColor: isToday ? (site?.theme_json as any)?.theme?.primary || '#3B82F6' : '#BFDBFE',
                          }}
                        />
                        {(i === 0 || i === 6 || i === 13 || isToday) && (
                          <span className="text-gray-400 text-[9px] whitespace-nowrap">{label}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bookings per week */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Recent Bookings</h3>
              {bookings.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No bookings yet.</p>
              ) : (
                <div className="space-y-2">
                  {['confirmed', 'pending', 'cancelled'].map(status => {
                    const count = bookings.filter(b => b.status === status).length
                    const pct = Math.round((count / bookings.length) * 100)
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20 capitalize">{status}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{
                            width: `${pct}%`,
                            backgroundColor: status === 'confirmed' ? '#16a34a' : status === 'pending' ? '#f59e0b' : '#ef4444'
                          }} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    )
                  })}
                  <p className="text-gray-400 text-xs mt-2">{bookings.length} total bookings</p>
                </div>
              )}
            </div>

            {/* Where bookings come from — attribution breakdown */}
            {sourceBreakdown.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-4">Where Bookings Come From</h3>
                <div className="space-y-2">
                  {sourceBreakdown.map(({ source, count }) => {
                    const total = sourceBreakdown.reduce((s, r) => s + r.count, 0)
                    const pct   = Math.round((count / total) * 100)
                    const icons: Record<string, string> = {
                      direct: '🔗', google: '🔍', facebook: '📘', instagram: '📸',
                      twitter: '🐦', tiktok: '🎵', youtube: '📺', whatsapp: '💬',
                      email: '📧', referral: '🔁',
                    }
                    const icon = icons[source] ?? '📎'
                    return (
                      <div key={source} className="flex items-center gap-3">
                        <span className="text-base w-6 shrink-0">{icon}</span>
                        <span className="text-xs text-gray-600 w-20 capitalize shrink-0">{source}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{
                            width: `${pct}%`,
                            backgroundColor: (site?.theme_json as any)?.theme?.primary || '#3B82F6',
                          }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-12 text-right">{count} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-gray-400 text-xs mt-3">Based on {sourceBreakdown.reduce((s, r) => s + r.count, 0)} bookings with source data. Run <code className="font-mono bg-gray-100 px-1 rounded">supabase/attribution.sql</code> to enable tracking.</p>
              </div>
            )}

            {/* Geographic breakdown — where visitors come from */}
            {geoBreakdown.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-4">Where Visitors Come From</h3>
                <div className="space-y-2">
                  {geoBreakdown.map(({ country, count, pct }) => {
                    const flagMap: Record<string, string> = {
                      AU: '🇦🇺', PH: '🇵🇭', US: '🇺🇸', GB: '🇬🇧', NZ: '🇳🇿',
                      CA: '🇨🇦', SG: '🇸🇬', MY: '🇲🇾', IN: '🇮🇳', AE: '🇦🇪',
                      JP: '🇯🇵', KR: '🇰🇷', HK: '🇭🇰', TW: '🇹🇼', ID: '🇮🇩',
                      DE: '🇩🇪', FR: '🇫🇷', NL: '🇳🇱', IT: '🇮🇹', ES: '🇪🇸',
                    }
                    const flag = flagMap[country] ?? '🌏'
                    const countryNames: Record<string, string> = {
                      AU: 'Australia', PH: 'Philippines', US: 'United States',
                      GB: 'United Kingdom', NZ: 'New Zealand', CA: 'Canada',
                      SG: 'Singapore', MY: 'Malaysia', IN: 'India', AE: 'UAE',
                      JP: 'Japan', KR: 'South Korea', HK: 'Hong Kong',
                      TW: 'Taiwan', ID: 'Indonesia', DE: 'Germany',
                      FR: 'France', NL: 'Netherlands', IT: 'Italy', ES: 'Spain',
                    }
                    const label = countryNames[country] ?? country
                    return (
                      <div key={country} className="flex items-center gap-3">
                        <span className="text-base w-7 shrink-0">{flag}</span>
                        <span className="text-xs text-gray-600 w-28 shrink-0">{label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{
                            width: `${pct}%`,
                            backgroundColor: (site?.theme_json as any)?.theme?.primary || '#3B82F6',
                          }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-14 text-right">{count} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-gray-400 text-xs mt-3">
                  Based on {geoBreakdown.reduce((s, r) => s + r.count, 0)} page views with location data (last 14 days).
                  Run <code className="font-mono bg-gray-100 px-1 rounded">supabase/geo-analytics.sql</code> to enable.
                </p>
              </div>
            )}

            <button
              onClick={() => site && loadAnalytics(site.id)}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
            >
              ↻ Refresh analytics
            </button>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && site && (
          <div className="space-y-5">
            {/* Logo upload */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Business Logo</h3>
              <p className="text-gray-500 text-sm mb-4">Shown in your site header. PNG with transparent background recommended.</p>
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl
                    ? <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                    : <span className="text-gray-300 text-2xl font-bold">{site.business_name.charAt(0)}</span>
                  }
                </div>
                <div>
                  <button onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg transition"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {logoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {logoUrl ? 'Replace Logo' : 'Upload Logo'}
                  </button>
                  <p className="text-gray-400 text-xs mt-1">PNG, JPG, SVG · Max 2MB</p>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleLogoUpload(e.target.files?.[0] || null)} />
              </div>
            </div>

            {/* Auto-confirm toggle */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Timezone</h3>
              <p className="text-gray-500 text-sm mb-3">
                All bookings on this site display in this timezone.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">🌏</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{siteTimezone}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Set at site creation · contact support to change</p>
                </div>
              </div>
            </div>

            {/* Auto-confirm toggle */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Booking Confirmation</h3>
              <p className="text-gray-500 text-sm mb-4">
                Choose how new bookings are handled when a customer submits.
              </p>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {(site as any).auto_confirm !== false ? 'Auto-confirm bookings' : 'Manual review required'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(site as any).auto_confirm !== false
                      ? 'Bookings are instantly confirmed. Best for high-volume businesses.'
                      : 'You review each booking before confirming. Best for premium services.'}
                  </p>
                </div>
                <div
                  onClick={async () => {
                    const newVal = (site as any).auto_confirm === false ? true : false
                    await supabase.from('sites').update({ auto_confirm: newVal } as any).eq('id', site.id)
                    setSite(prev => prev ? { ...prev, auto_confirm: newVal } as any : prev)
                  }}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative shrink-0 ml-4 ${(site as any).auto_confirm !== false ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${(site as any).auto_confirm !== false ? 'left-7' : 'left-1'}`} />
                </div>
              </div>
            </div>

            {/* PIN change */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Change Dashboard PIN</h3>
              <p className="text-gray-500 text-sm mb-4">
                Current PIN: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{site.owner_pin}</span>
              </p>
              <form onSubmit={handlePinChange} className="space-y-3 max-w-sm">
                <div>
                  <label className="text-gray-700 text-xs font-medium block mb-1">New PIN (min 4 characters)</label>
                  <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)}
                    placeholder="Enter new PIN" maxLength={12}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 font-mono tracking-widest" />
                </div>
                <div>
                  <label className="text-gray-700 text-xs font-medium block mb-1">Confirm New PIN</label>
                  <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)}
                    placeholder="Repeat new PIN" maxLength={12}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 font-mono tracking-widest" />
                </div>
                {pinMsg && (
                  <p className={`text-xs ${pinMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{pinMsg.text}</p>
                )}
                <button type="submit" disabled={pinSaving || !newPin || !confirmPin}
                  className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {pinSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {pinSaving ? 'Saving...' : 'Update PIN'}
                </button>
              </form>
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

        {/* ── BLOCKED DATES ── */}
        {tab === 'blocked' && site && (
          <BlockedDatesTab siteId={site.id} primaryColor={primaryColor} />
        )}

        {/* ── CUSTOMERS ── */}
        {tab === 'customers' && site && (
          <CustomersTab siteId={site.id} primaryColor={primaryColor} />
        )}

        {/* ── COUPONS ── */}
        {tab === 'coupons' && site && (
          <CouponsTab siteId={site.id} currencySymbol={(site as any).currency || '$'} />
        )}

        {/* ── INQUIRIES ── */}
        {tab === 'inquiries' && site && (
          <InquiriesTab siteId={site.id} primaryColor={primaryColor} />
        )}

        {/* ── CALENDAR ── */}
        {tab === 'calendar' && site && (
          <CalendarTab siteId={site.id} primaryColor={primaryColor} siteTimezone={siteTimezone} />
        )}
      </div>
    </div>
  )
}
