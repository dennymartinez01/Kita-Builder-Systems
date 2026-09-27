'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { BlockedDate } from '@/types/database'
import { Plus, Trash2, Calendar, Loader2, CheckCircle } from 'lucide-react'

interface BlockedDatesTabProps {
  siteId: string
  primaryColor: string
}

export default function BlockedDatesTab({ siteId, primaryColor }: BlockedDatesTabProps) {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newBlock, setNewBlock] = useState({
    date: '',
    start_time: '',
    end_time: '',
    reason: '',
    full_day: true,
  })

  useEffect(() => { loadBlocked() }, [siteId])

  async function loadBlocked() {
    setLoading(true)
    const { data } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('site_id', siteId)
      .order('date')
    setBlockedDates(data || [])
    setLoading(false)
  }

  async function addBlock() {
    if (!newBlock.date) return
    setSaving(true)
    const { data, error } = await supabase.from('blocked_dates').insert({
      site_id: siteId,
      date: newBlock.date,
      start_time: newBlock.full_day ? null : newBlock.start_time || null,
      end_time: newBlock.full_day ? null : newBlock.end_time || null,
      reason: newBlock.reason || null,
    } as any).select().single()

    if (!error && data) {
      setBlockedDates(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
      setNewBlock({ date: '', start_time: '', end_time: '', reason: '', full_day: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function removeBlock(id: string) {
    await supabase.from('blocked_dates').delete().eq('id', id)
    setBlockedDates(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">Block Out Dates</p>
          <p className="text-xs text-gray-500 mt-0.5">Customers cannot book during blocked times.</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle size={13} /> Saved!
          </span>
        )}
      </div>

      {/* Add new block */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-medium text-gray-500 mb-3">Add blocked date</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Date</label>
              <input
                type="date"
                value={newBlock.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setNewBlock(p => ({ ...p, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Reason (optional)</label>
              <input
                type="text"
                value={newBlock.reason}
                onChange={e => setNewBlock(p => ({ ...p, reason: e.target.value }))}
                placeholder="e.g. Public holiday"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Full day toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setNewBlock(p => ({ ...p, full_day: !p.full_day }))}
              className={`w-9 h-5 rounded-full cursor-pointer transition-colors relative ${newBlock.full_day ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${newBlock.full_day ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-gray-700">{newBlock.full_day ? 'Full day' : 'Specific hours'}</span>
          </label>

          {!newBlock.full_day && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 text-xs mb-1 block">From</label>
                <input
                  type="time"
                  value={newBlock.start_time}
                  onChange={e => setNewBlock(p => ({ ...p, start_time: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block">To</label>
                <input
                  type="time"
                  value={newBlock.end_time}
                  onChange={e => setNewBlock(p => ({ ...p, end_time: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            onClick={addBlock}
            disabled={!newBlock.date || saving}
            className="flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add Block
          </button>
        </div>
      </div>

      {/* Existing blocks */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
      ) : blockedDates.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No blocked dates. Add a block above.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {blockedDates.map(b => (
            <div key={b.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(b.date + 'T12:00:00').toLocaleDateString('en-AU', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {b.start_time ? `${b.start_time} – ${b.end_time || 'end of day'}` : 'Full day'}
                  {b.reason && ` · ${b.reason}`}
                </p>
              </div>
              <button
                onClick={() => removeBlock(b.id)}
                className="text-gray-300 hover:text-red-400 transition p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
