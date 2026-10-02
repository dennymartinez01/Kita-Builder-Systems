'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Mail, Phone, User, MessageSquare, Tag } from 'lucide-react'
import { getStoredAttribution } from '@/lib/attribution'

interface ContactFormProps {
  siteId: string
  primaryColor: string
  services?: { id: string; name: string }[]
}

export default function ContactForm({ siteId, primaryColor, services = [] }: ContactFormProps) {
  const [form, setForm] = useState({
    name:             '',
    email:            '',
    phone:            '',
    service_interest: '',
    message:          '',
    opt_in:           false,
  })
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')

  function set(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/inquire', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id:          siteId,
          name:             form.name,
          email:            form.email,
          phone:            form.phone || undefined,
          service_interest: form.service_interest || undefined,
          message:          form.message,
          opt_in:           form.opt_in,
          ...getStoredAttribution(),  // attach UTM + referrer
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle size={48} className="mx-auto mb-4" style={{ color: primaryColor }} />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received!</h3>
        <p className="text-gray-500 text-sm mb-4">
          Thanks, <strong>{form.name}</strong>! We will get back to you as soon as possible.
        </p>
        {form.opt_in && (
          <p className="text-gray-400 text-xs">You are opted in to receive occasional offers from us.</p>
        )}
        <button
          onClick={() => { setDone(false); setForm({ name: '', email: '', phone: '', service_interest: '', message: '', opt_in: false }) }}
          className="mt-4 text-sm underline text-gray-400 hover:text-gray-600"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Send Us a Message</h2>
      <p className="text-gray-500 text-sm mb-5">Not ready to book yet? Ask us anything — we usually reply within a few hours.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+61 400 000 000"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </div>

        {/* Service interest */}
        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interested in <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={form.service_interest}
                onChange={e => set('service_interest', e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white appearance-none"
              >
                <option value="">— Any service —</option>
                {services.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <div className="relative">
            <MessageSquare size={14} className="absolute left-3 top-3.5 text-gray-400" />
            <textarea
              required
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="What would you like to know? Ask about pricing, availability, what to expect..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
            />
          </div>
        </div>

        {/* Opt-in */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => set('opt_in', !form.opt_in)}
            className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition ${
              form.opt_in ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'
            }`}
          >
            {form.opt_in && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-gray-500 text-xs leading-relaxed mt-0.5">
            I am happy to receive occasional offers and updates from this business.
          </span>
        </label>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-bold rounded-xl py-4 text-base flex items-center justify-center gap-2 transition disabled:opacity-60 active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" />Sending...</>
            : 'Send Message'
          }
        </button>
      </form>
    </div>
  )
}
