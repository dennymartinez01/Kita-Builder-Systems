'use client'

import { useState, useEffect } from 'react'
import type { Service, Staff } from '@/types/database'
import { CheckCircle, Loader2, Calendar, Clock, Phone, User, Car, PawPrint, MessageSquare, Users, Mail, AlertCircle, Info, Tag, X } from 'lucide-react'
import { checkSlotAvailability, getNextAvailableSlot, getSavedBookingDetails, saveBookingDetails } from '@/lib/booking-utils'
import { getTodayInTimezone } from '@/lib/timezones'
import { getStoredAttribution } from '@/lib/attribution'

interface BookingFormProps {
  siteId: string
  services: Service[]
  staff?: Staff[]
  requiresField: 'car_model' | 'pet_name' | 'none'
  primaryColor: string
  depositPercent: number
  title?: string
  notesLabel?: string
  notesPlaceholder?: string
  notesRequired?: boolean
  currencySymbol?: string
  siteTimezone?: string
  enableCustomerAccounts?: boolean  // Phase 11 — entitlement-gated
  enableCoupons?: boolean           // Phase 11 — entitlement-gated
}

export default function BookingForm({
  siteId,
  services,
  staff = [],
  requiresField,
  primaryColor,
  depositPercent,
  title = 'Book an Appointment',
  notesLabel = 'Notes',
  notesPlaceholder = 'Anything we should know...',
  notesRequired = false,
  currencySymbol = '$',
  siteTimezone = 'UTC',
  enableCustomerAccounts = false,
  enableCoupons = false,
}: BookingFormProps) {
  const [form, setForm] = useState({
    service_id: services[0]?.id || '',
    service_name: services[0]?.name || '',
    staff_id: '',
    staff_name: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    booking_date: '',
    booking_time: '',
    car_model: '',
    pet_name: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [doneData, setDoneData] = useState<{ booking_id: string; cancel_token: string; status: string } | null>(null)
  const [error, setError] = useState('')
  const [availabilityError, setAvailabilityError] = useState('')
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [nextSlot, setNextSlot] = useState<{ date: string; time: string } | null>(null)
  const [loadingNextSlot, setLoadingNextSlot] = useState(false)
  // Customer account opt-in
  const [registerAccount, setRegisterAccount] = useState(false)
  // Coupon code
  const [couponCode, setCouponCode]         = useState('')
  const [couponLoading, setCouponLoading]   = useState(false)
  const [couponResult, setCouponResult]     = useState<{ valid: boolean; discount_amount: number; label: string; error: string | null } | null>(null)

  // Auto-fill from localStorage on mount
  useEffect(() => {
    const saved = getSavedBookingDetails()
    if (saved) {
      setForm(prev => ({
        ...prev,
        customer_name: saved.customer_name || prev.customer_name,
        customer_phone: saved.customer_phone || prev.customer_phone,
        customer_email: saved.customer_email || prev.customer_email,
      }))
    }
  }, [])

  // Fetch next available slot on mount
  useEffect(() => {
    if (siteId && services[0]) {
      setLoadingNextSlot(true)
      getNextAvailableSlot(siteId, services[0].duration_minutes)
        .then(slot => setNextSlot(slot))
        .catch(() => {})
        .finally(() => setLoadingNextSlot(false))
    }
  }, [siteId, services[0]?.id])
  function setField(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleServiceChange(serviceId: string) {
    const service = services.find(s => s.id === serviceId)
    setForm(prev => ({
      ...prev,
      service_id: serviceId,
      service_name: service?.name || '',
      // Reset staff when service changes
      staff_id: '',
      staff_name: '',
    }))
  }

  function handleStaffChange(staffId: string) {
    if (!staffId) {
      setForm(prev => ({ ...prev, staff_id: '', staff_name: '' }))
      return
    }
    const member = staff.find(s => s.id === staffId)
    setForm(prev => ({
      ...prev,
      staff_id: staffId,
      staff_name: member?.name || '',
    }))
  }

  async function validateCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponResult(null)
    try {
      const selectedService = services.find(s => s.id === form.service_id)
      const params = new URLSearchParams({
        code:           couponCode.trim(),
        site_id:        siteId,
        booking_amount: String(selectedService?.price ?? 0),
      })
      if (form.service_id) params.set('service_id', form.service_id)
      if (form.customer_email) params.set('customer_email', form.customer_email)

      const res  = await fetch(`/api/coupons/validate?${params}`)
      const data = await res.json()

      if (data.valid) {
        const label = data.coupon.discount_type === 'percentage'
          ? `${data.coupon.discount_value}% off`
          : `${currencySymbol}${data.coupon.discount_value} off`
        setCouponResult({ valid: true, discount_amount: data.discount_amount, label, error: null })
      } else {
        setCouponResult({ valid: false, discount_amount: 0, label: '', error: data.error })
      }
    } catch {
      setCouponResult({ valid: false, discount_amount: 0, label: '', error: 'Could not validate coupon. Try again.' })
    } finally {
      setCouponLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setAvailabilityError('')

    // Check slot availability before submitting
    if (form.booking_date && form.booking_time) {
      setCheckingAvailability(true)
      const selectedService = services.find(s => s.id === form.service_id)
      const avail = await checkSlotAvailability(siteId, form.booking_date, form.booking_time, selectedService?.duration_minutes || 60)
      setCheckingAvailability(false)
      if (!avail.available) {
        setAvailabilityError(avail.reason || 'This slot is not available.')
        setLoading(false)
        return
      }
    }

    try {
      const selectedService = services.find(s => s.id === form.service_id)
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: siteId,
          ...form,
          service_duration_minutes: selectedService?.duration_minutes || 60,
          coupon_code:     couponResult?.valid ? couponCode.trim() : undefined,
          discount_amount: couponResult?.valid ? couponResult.discount_amount : undefined,
          ...getStoredAttribution(),  // attach UTM + referrer
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')

      // Save details to localStorage for auto-fill next time
      saveBookingDetails({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email,
      })

      // Register customer account if opted in and email provided
      if (registerAccount && form.customer_email) {
        fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site_id:  siteId,
            email:    form.customer_email,
            name:     form.customer_name,
            phone:    form.customer_phone || undefined,
            action:   'register',
          }),
        }).catch(() => {}) // non-blocking
      }

      setDoneData({ booking_id: data.booking?.id, cancel_token: data.booking?.cancel_token, status: data.status })
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    const confirmUrl = doneData?.booking_id ? `/booking/${doneData.booking_id}?token=${doneData.cancel_token}` : null
    const isPending = doneData?.status === 'pending'
    return (
      <div className="text-center py-6">
        <CheckCircle size={48} className="mx-auto mb-4" style={{ color: primaryColor }} />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {isPending ? 'Booking Request Received!' : 'Booking Confirmed!'}
        </h3>
        <p className="text-gray-600 text-sm mb-1">
          Thanks, <strong>{form.customer_name}</strong>! Your appointment for <strong>{form.service_name}</strong> {isPending ? 'is awaiting confirmation.' : 'is confirmed.'}
        </p>
        {form.staff_name && <p className="text-gray-500 text-sm mb-1">With <strong>{form.staff_name}</strong></p>}
        <p className="text-gray-500 text-sm mb-4">
          {form.booking_date} at {form.booking_time}
        </p>
        {form.customer_email && <p className="text-gray-400 text-xs mb-4">Confirmation sent to {form.customer_email}</p>}
        {confirmUrl && (
          <a
            href={confirmUrl}
            className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl mb-3 transition hover:opacity-90"
            style={{ backgroundColor: primaryColor, color: 'white' }}
          >
            View Booking Details →
          </a>
        )}
        <br />
        <button
          onClick={() => {
            setDone(false)
            setDoneData(null)
            setForm({
              service_id: services[0]?.id || '',
              service_name: services[0]?.name || '',
              staff_id: '', staff_name: '',
              customer_name: '', customer_phone: '', customer_email: '',
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

      {/* Next available slot suggestion */}
      {nextSlot && !form.booking_date && (
        <div
          className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 cursor-pointer hover:bg-blue-100 transition"
          onClick={() => setForm(prev => ({ ...prev, booking_date: nextSlot.date, booking_time: nextSlot.time }))}
        >
          <div className="flex items-center gap-2">
            <Info size={14} className="text-blue-500 shrink-0" />
            <p className="text-blue-700 text-xs">
              <span className="font-semibold">Next available:</span> {new Date(nextSlot.date + 'T12:00:00').toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })} at {nextSlot.time}
            </p>
          </div>
          <span className="text-blue-600 text-xs font-medium">Use this →</span>
        </div>
      )}
      {loadingNextSlot && (
        <p className="text-gray-400 text-xs mb-4 flex items-center gap-1">
          <Loader2 size={12} className="animate-spin" /> Checking availability...
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
          <select
            value={form.service_id}
            onChange={e => handleServiceChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2"
            required
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {currencySymbol}{s.price} ({s.duration_minutes} min)
              </option>
            ))}
          </select>
        </div>

        {/* Staff picker — only show if there are staff members */}
        {staff.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Staff <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={form.staff_id}
                onChange={e => handleStaffChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 appearance-none"
              >
                <option value="">No preference — any available staff</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Name + Phone — stack on mobile */}
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

        {/* Email — optional, for confirmation email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-gray-400 font-normal">(optional — for booking confirmation)</span>
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={form.customer_email}
              onChange={e => setField('customer_email', e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </div>

        {/* Date + Time — full width on mobile, side by side on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="date"
                value={form.booking_date}
                min={getTodayInTimezone(siteTimezone)}
                onChange={e => { setField('booking_date', e.target.value); setAvailabilityError('') }}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2"
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
                onChange={e => { setField('booking_time', e.target.value); setAvailabilityError('') }}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Availability error */}
        {availabilityError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700">{availabilityError}</p>
          </div>
        )}
        {checkingAvailability && (
          <p className="text-gray-400 text-xs flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" /> Checking availability...
          </p>
        )}

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

        {/* Notes — custom label per template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {notesLabel} {notesRequired ? <span className="text-red-400">*</span> : <span className="text-gray-400 font-normal">(optional)</span>}
          </label>
          <div className="relative">
            <MessageSquare size={14} className="absolute left-3 top-3.5 text-gray-400" />
            <textarea
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder={notesPlaceholder}
              required={notesRequired}
              rows={2}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
            />
          </div>
        </div>

        {/* Coupon code — shown when feature enabled */}
        {enableCoupons && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Promo / Coupon Code <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), validateCoupon())}
                  placeholder="Enter code e.g. WELCOME20"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 font-mono uppercase"
                />
              </div>
              <button
                type="button"
                onClick={validateCoupon}
                disabled={!couponCode.trim() || couponLoading}
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
              </button>
            </div>

            {/* Coupon result */}
            {couponResult && (
              <div className={`flex items-center justify-between mt-2 px-3 py-2 rounded-xl text-xs ${
                couponResult.valid
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                <div className="flex items-center gap-1.5">
                  {couponResult.valid
                    ? <><CheckCircle size={13} /><span className="font-semibold">{couponResult.label}</span> applied — you save {currencySymbol}{couponResult.discount_amount.toFixed(2)}</>
                    : <><AlertCircle size={13} />{couponResult.error}</>
                  }
                </div>
                {couponResult.valid && (
                  <button type="button" onClick={() => { setCouponCode(''); setCouponResult(null) }} className="ml-2 hover:opacity-70">
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Customer account opt-in — shown when feature enabled and email provided */}
        {enableCustomerAccounts && form.customer_email && (
          <label className="flex items-start gap-3 cursor-pointer bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <div
              onClick={() => setRegisterAccount(prev => !prev)}
              className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition ${
                registerAccount ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
              }`}
            >
              {registerAccount && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div>
              <p className="text-gray-800 text-sm font-medium">Save my details for faster future bookings</p>
              <p className="text-gray-500 text-xs mt-0.5">We will remember your name, phone, and email so you do not have to type them again.</p>
            </div>
          </label>
        )}

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-bold rounded-xl py-4 text-base flex items-center justify-center gap-2 transition disabled:opacity-60 active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" />Confirming...</>
          ) : (
            depositPercent > 0 ? `Pay ${depositPercent}% Deposit & Confirm` : 'Confirm Booking'
          )}
        </button>

        {selectedService && (
          <p className="text-center text-gray-400 text-xs">
            {selectedService.name} · {currencySymbol}{selectedService.price} · {selectedService.duration_minutes} min
            {form.staff_name && <> · with {form.staff_name}</>}
          </p>
        )}
      </form>
    </div>
  )
}
