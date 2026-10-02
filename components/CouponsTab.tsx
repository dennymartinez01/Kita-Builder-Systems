'use client'

import { useEffect, useState, useCallback } from 'react'
import { Tag, Plus, Trash2, Loader2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Edit2, X } from 'lucide-react'
import type { Coupon } from '@/types/database'

interface Props {
  siteId: string
  currencySymbol?: string
}

const EMPTY_FORM = {
  code:                 '',
  description:          '',
  discount_type:        'percentage' as 'percentage' | 'fixed',
  discount_value:       '',
  min_booking_amount:   '',
  max_discount:         '',
  usage_limit:          '',
  per_customer_limit:   '1',
  starts_at:            '',
  expires_at:           '',
  active:               true,
}

function formatDiscount(c: Coupon, symbol: string) {
  return c.discount_type === 'percentage'
    ? `${c.discount_value}% off`
    : `${symbol}${c.discount_value} off`
}

export default function CouponsTab({ siteId, currencySymbol = '$' }: Props) {
  const [coupons, setCoupons]     = useState<Coupon[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [status, setStatus]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [form, setForm]           = useState({ ...EMPTY_FORM })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/coupons?site_id=${siteId}`)
      const data = await res.json()
      setCoupons(data.coupons ?? [])
    } finally {
      setLoading(false)
    }
  }, [siteId])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
    setStatus(null)
  }

  function openEdit(c: Coupon) {
    setEditId(c.id)
    setForm({
      code:               c.code,
      description:        c.description ?? '',
      discount_type:      c.discount_type,
      discount_value:     String(c.discount_value),
      min_booking_amount: String(c.min_booking_amount ?? ''),
      max_discount:       c.max_discount != null ? String(c.max_discount) : '',
      usage_limit:        c.usage_limit != null ? String(c.usage_limit) : '',
      per_customer_limit: c.per_customer_limit != null ? String(c.per_customer_limit) : '1',
      starts_at:          c.starts_at ? c.starts_at.split('T')[0] : '',
      expires_at:         c.expires_at ? c.expires_at.split('T')[0] : '',
      active:             c.active,
    })
    setShowForm(true)
    setStatus(null)
  }

  async function handleSave() {
    if (!form.code || !form.discount_value) {
      setStatus({ type: 'error', msg: 'Code and discount value are required.' })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/coupons', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:                  editId || undefined,
          site_id:             siteId,
          code:                form.code,
          description:         form.description || null,
          discount_type:       form.discount_type,
          discount_value:      parseFloat(form.discount_value),
          min_booking_amount:  parseFloat(form.min_booking_amount || '0'),
          max_discount:        form.max_discount ? parseFloat(form.max_discount) : null,
          usage_limit:         form.usage_limit ? parseInt(form.usage_limit) : null,
          per_customer_limit:  form.per_customer_limit ? parseInt(form.per_customer_limit) : 1,
          starts_at:           form.starts_at ? new Date(form.starts_at).toISOString() : null,
          expires_at:          form.expires_at ? new Date(form.expires_at + 'T23:59:59').toISOString() : null,
          active:              form.active,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setStatus({ type: 'success', msg: editId ? 'Coupon updated.' : 'Coupon created!' })
      setShowForm(false)
      setEditId(null)
      load()
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await fetch(`/api/coupons?id=${id}&site_id=${siteId}`, { method: 'DELETE' })
      load()
    } finally {
      setDeleting(null)
    }
  }

  async function toggleActive(c: Coupon) {
    await fetch('/api/coupons', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: c.id, site_id: siteId, code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, active: !c.active }),
    })
    load()
  }

  function setField(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
            <Tag size={18} />
            Coupon Codes
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
          style={{ backgroundColor: '#2563eb' }}
        >
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
          status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {status.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {status.msg}
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">{editId ? 'Edit Coupon' : 'New Coupon'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Code <span className="text-red-400">*</span></label>
              <input
                value={form.code}
                onChange={e => setField('code', e.target.value.toUpperCase())}
                placeholder="WELCOME20"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Description</label>
              <input
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="e.g. First visit discount"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Discount type */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Discount Type <span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                {(['percentage', 'fixed'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setField('discount_type', t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition ${
                      form.discount_type === t
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-blue-200'
                    }`}
                  >
                    {t === 'percentage' ? '% Percentage' : `${currencySymbol} Fixed Amount`}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount value */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">
                Discount Value <span className="text-red-400">*</span>
                <span className="text-gray-400 font-normal ml-1">
                  {form.discount_type === 'percentage' ? '(%)' : `(${currencySymbol})`}
                </span>
              </label>
              <input
                type="number"
                min="0"
                step={form.discount_type === 'percentage' ? '1' : '0.01'}
                max={form.discount_type === 'percentage' ? '100' : undefined}
                value={form.discount_value}
                onChange={e => setField('discount_value', e.target.value)}
                placeholder={form.discount_type === 'percentage' ? '20' : '15.00'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Min booking amount */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Min. Booking ({currencySymbol})</label>
              <input
                type="number" min="0" step="0.01"
                value={form.min_booking_amount}
                onChange={e => setField('min_booking_amount', e.target.value)}
                placeholder="0 = no minimum"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Max discount (percentage only) */}
            {form.discount_type === 'percentage' && (
              <div>
                <label className="text-gray-600 text-xs font-medium block mb-1">Max Discount Cap ({currencySymbol})</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.max_discount}
                  onChange={e => setField('max_discount', e.target.value)}
                  placeholder="Leave blank = no cap"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                />
              </div>
            )}

            {/* Usage limit */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Total Usage Limit</label>
              <input
                type="number" min="1"
                value={form.usage_limit}
                onChange={e => setField('usage_limit', e.target.value)}
                placeholder="Leave blank = unlimited"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Per customer */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Uses Per Customer</label>
              <input
                type="number" min="1"
                value={form.per_customer_limit}
                onChange={e => setField('per_customer_limit', e.target.value)}
                placeholder="1"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Start date */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Start Date</label>
              <input
                type="date"
                value={form.starts_at}
                onChange={e => setField('starts_at', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Expiry date */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => setField('expires_at', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setField('active', !form.active)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-gray-700 text-sm">{form.active ? 'Active — customers can use this code' : 'Inactive — code will not work'}</span>
          </label>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            {saving ? 'Saving...' : (editId ? 'Update Coupon' : 'Create Coupon')}
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
          <Tag size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">No coupons yet</p>
          <p className="text-gray-400 text-xs">Create a coupon code to offer discounts to your customers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map(c => {
            const isExpired = c.expires_at && new Date(c.expires_at) < new Date()
            const isExhausted = c.usage_limit != null && c.usage_count >= c.usage_limit
            return (
              <div key={c.id} className={`bg-white border rounded-2xl p-4 ${!c.active || isExpired || isExhausted ? 'opacity-60' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-bold text-gray-900 text-sm bg-gray-100 px-2 py-0.5 rounded">{c.code}</span>
                      <span className="text-blue-600 text-xs font-semibold">{formatDiscount(c, currencySymbol)}</span>
                      {!c.active && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Inactive</span>}
                      {isExpired && <span className="text-xs text-red-400 bg-red-50 px-2 py-0.5 rounded">Expired</span>}
                      {isExhausted && <span className="text-xs text-orange-400 bg-orange-50 px-2 py-0.5 rounded">Limit reached</span>}
                    </div>
                    {c.description && <p className="text-gray-500 text-xs">{c.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                      {c.usage_limit != null && <span>Used: {c.usage_count}/{c.usage_limit}</span>}
                      {c.min_booking_amount > 0 && <span>Min: {currencySymbol}{c.min_booking_amount}</span>}
                      {c.expires_at && <span>Expires: {new Date(c.expires_at).toLocaleDateString('en-AU')}</span>}
                      {c.per_customer_limit != null && <span>{c.per_customer_limit}x per customer</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(c)} className="p-1.5 text-gray-400 hover:text-gray-700 transition" title={c.active ? 'Deactivate' : 'Activate'}>
                      {c.active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 transition">
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      disabled={deleting === c.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                    >
                      {deleting === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Setup note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-blue-700 text-xs font-semibold mb-1">ℹ️ About Coupon Codes</p>
        <p className="text-blue-600 text-xs leading-relaxed">
          Customers enter coupon codes during booking. Codes are validated server-side — discounts are applied before the owner is notified.
          Run <code className="font-mono bg-blue-100 px-1 rounded">supabase/coupons.sql</code> to enable this feature.
          Available on Growth+ plans.
        </p>
      </div>
    </div>
  )
}
