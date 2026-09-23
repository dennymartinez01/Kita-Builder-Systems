'use client'

import { useState } from 'react'
import type { Service } from '@/types/database'
import { CheckCircle, Loader2, Calendar, Clock, Phone, User, Car, PawPrint, MessageSquare } from 'lucide-react'

interface BookingFormProps {
  siteId: string
  services: Service[]
  requiresField: 'car_model' | 'pet_name' | 'none'
  primaryColor: string
  depositPercent: number
  title?: string
}

export default function BookingForm({
  siteId,
  services,
  requiresField,
  primaryColor,
  depositPercent,
  title = 'Book an Appointment',
}: BookingFormProps) {
  const [form, setForm] = useState({
    service_id: services[0]?.id || '',
    service_name: services[0]?.name || '',
    customer_name: '',
    customer_phone: '',
    booking_date: '',
    booking_time: '',
    car_model: '',
    pet_name: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function setField(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleServiceChange(serviceId: string) {
    const service = services.find(s => s.id === serviceId)
    setForm(prev => ({
      ...prev,
      service_id: serviceId,
      service_name: service?.name || '',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: siteId,
          ...form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600 text-sm mb-1">
          Thanks, <strong>{form.customer_name}</strong>! Your appointment for <strong>{form.service_name}</strong> is booked.
        </p>
        <p className="text-gray-500 text-sm">
          {form.booking_date} at {form.booking_time} · We'll be in touch at {form.customer_phone}.
        </p>
        <button
          onClick={() => {
            setDone(false)
            setForm({
              service_id: services[0]?.id || '',
              service_name: services[0]?.name || '',
              customer_name: '', customer_phone: '',
              booking_date: '', booking_time: '',
              car_model: '', pet_name: '', notes: '',
            })
          }}
          className="mt-6 text-sm underline text-gray-500 hover:text-gray-700"
        >
          Book another appointment
        </button>
      </div>
    )
  }

  const selectedService = services.find(s => s.id === form.service_id)

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-5">{title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
          <select
            value={form.service_id}
            onChange={e => handleServiceChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-0"
            style={{ '--tw-ring-color': primaryColor } as any}
            required
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — ${s.price} ({s.duration_minutes} min)
              </option>
            ))}
          </select>
        </div>

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                value={form.customer_name}
                onChange={e => setField('customer_name', e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="tel"
                value={form.customer_phone}
                onChange={e => setField('customer_phone', e.target.value)}
                placeholder="+61 400 000 000"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="date"
                value={form.booking_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setField('booking_date', e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
            <div className="relative">
              <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="time"
                value={form.booking_time}
                onChange={e => setField('booking_time', e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Conditional fields */}
        {requiresField === 'car_model' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle (Make / Model / Year)</label>
            <div className="relative">
              <Car size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                value={form.car_model}
                onChange={e => setField('car_model', e.target.value)}
                placeholder="e.g. Toyota HiLux 2021"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
        )}

        {requiresField === 'pet_name' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name & Type</label>
            <div className="relative">
              <PawPrint size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                value={form.pet_name}
                onChange={e => setField('pet_name', e.target.value)}
                placeholder="e.g. Biscuit — Golden Retriever"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
        )}

        {/* Optional notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <MessageSquare size={14} className="absolute left-3 top-3.5 text-gray-400" />
            <textarea
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Anything we should know..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition disabled:opacity-60"
          style={{ backgroundColor: primaryColor }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              {depositPercent > 0
                ? `Pay ${depositPercent}% Deposit & Confirm`
                : 'Confirm Booking'}
            </>
          )}
        </button>

        {selectedService && (
          <p className="text-center text-gray-400 text-xs">
            {selectedService.name} · ${selectedService.price} · {selectedService.duration_minutes} min
          </p>
        )}
      </form>
    </div>
  )
}
