'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Site, Service, Booking } from '@/types/database'
import {
  CalendarCheck,
  Wrench,
  ExternalLink,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Loader2,
  Lock,
} from 'lucide-react'

type Tab = 'bookings' | 'services'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function OwnerDashboard({ params }: PageProps) {
  const [slug, setSlug] = useState<string | null>(null)
  const [site, setSite] = useState<Site | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tab, setTab] = useState<Tab>('bookings')
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState('')

  // Resolve params promise
  useEffect(() => {
    params.then(p => setSlug(p.slug))
  }, [params])

  const loadData = useCallback(async (siteId: string) => {
    const [svcsRes, bksRes] = await Promise.all([
      supabase.from('services').select('*').eq('site_id', siteId).order('created_at'),
      supabase.from('bookings').select('*').eq('site_id', siteId).order('booking_date', { ascending: false }),
    ])
    setServices(svcsRes.data || [])
    setBookings(bksRes.data || [])
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!slug) return
    setLoading(true)
    setPinError('')

    const { data: siteData } = await supabase.from('sites').select('*').eq('slug', slug).single()
    setLoading(false)

    if (!siteData) {
      setPinError('Site not found.')
      return
    }
    if (siteData.owner_pin !== pin) {
      setPinError('Wrong PIN. Please try again.')
      return
    }

    setSite(siteData)
    await loadData(siteData.id)
    setAuthed(true)
  }

  async function updateService(id: string, field: keyof Service, value: string | number) {
    await supabase.from('services').update({ [field]: value }).eq('id', id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  async function addService() {
    if (!site) return
    const { data } = await supabase.from('services').insert({
      site_id: site.id,
      name: 'New Service',
      price: 100,
      duration_minutes: 60,
    }).select().single()
    if (data) setServices(prev => [...prev, data])
  }

  async function deleteService(id: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  async function updateBookingStatus(id: string, status: Booking['status']) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const primaryColor = (site?.theme_json as any)?.theme?.primary || '#1A1A2E'

  // PIN gate
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-lg">
          <div className="text-center mb-6">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Lock size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-gray-900 text-lg">
              {slug ? `${slug.split('-').slice(0, -1).join(' ')} Dashboard` : 'Owner Dashboard'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Enter your PIN to manage your site</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="4-digit PIN"
              maxLength={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-gray-400"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-xs text-center">{pinError}</p>}
            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Enter Dashboard'}
            </button>
          </form>

          <p className="text-gray-400 text-xs text-center mt-4">
            Default PIN: <span className="font-mono">1234</span>
          </p>
        </div>
      </div>
    )
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="px-6 py-5"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">{site?.business_name}</h1>
            <p className="text-white/60 text-sm">Owner Dashboard</p>
          </div>
          <a
            href={`/${slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition"
          >
            View Site <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Pending', value: pendingBookings, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Confirmed', value: confirmedBookings, color: 'text-green-600 bg-green-50' },
            { label: 'Services', value: services.length, color: 'text-blue-600 bg-blue-50' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-4 text-center ${stat.color}`}>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium mt-0.5 opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl mb-5 w-fit">
          {([
            { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
            { id: 'services', label: 'Services & Prices', icon: Wrench },
          ] as const).map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={14} />
                {t.label}
                {t.id === 'bookings' && pendingBookings > 0 && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs rounded-full px-1.5 py-0.5 font-bold leading-none">
                    {pendingBookings}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CalendarCheck size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No bookings yet. Share your site link to get started.</p>
                <a
                  href={`/${slug}`}
                  target="_blank"
                  className="text-xs mt-2 inline-block hover:underline"
                  style={{ color: primaryColor }}
                >
                  View your site →
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
                            b.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : b.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs mt-1">
                          <strong>{b.service_name}</strong> · {b.booking_date} at {b.booking_time}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          📞 {b.customer_phone}
                          {b.car_model && <> · 🚗 {b.car_model}</>}
                          {b.pet_name && <> · 🐾 {b.pet_name}</>}
                          {b.notes && <> · 💬 {b.notes}</>}
                        </p>
                      </div>

                      {b.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => updateBookingStatus(b.id, 'confirmed')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Confirm"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => updateBookingStatus(b.id, 'cancelled')}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                            title="Cancel"
                          >
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

        {/* SERVICES TAB */}
        {tab === 'services' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Changes save instantly to your live site.</p>
              <button
                onClick={addService}
                className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus size={14} /> Add Service
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {services.map(service => (
                <div key={service.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <input
                      value={service.name}
                      onChange={e => updateService(service.id, 'name', e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 bg-transparent focus:outline-none focus:bg-gray-50 rounded px-2 py-1 -mx-2"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-400 text-xs">$</span>
                    <input
                      type="number"
                      value={service.price}
                      onChange={e => updateService(service.id, 'price', parseFloat(e.target.value))}
                      className="w-20 text-sm text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
                    />
                    <span className="text-gray-400 text-xs">min</span>
                    <input
                      type="number"
                      value={service.duration_minutes}
                      onChange={e => updateService(service.id, 'duration_minutes', parseInt(e.target.value))}
                      className="w-16 text-sm text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
                    />
                    <button
                      onClick={() => deleteService(service.id)}
                      className="text-gray-300 hover:text-red-400 transition p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
