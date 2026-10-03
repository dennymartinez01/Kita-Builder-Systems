'use client'

import { useEffect, useState, useCallback } from 'react'
import { ShieldOff, RefreshCw, Search, Download, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SuppressionEntry, SuppressionReason } from '@/types/database'

const REASON_COLORS: Record<SuppressionReason, string> = {
  unsubscribe: 'bg-blue-900/50 text-blue-400',
  admin:       'bg-purple-900/50 text-purple-400',
  bounce:      'bg-yellow-900/50 text-yellow-400',
  complaint:   'bg-red-900/50 text-red-400',
  other:       'bg-gray-800 text-gray-400',
}

const REASON_ICONS: Record<SuppressionReason, string> = {
  unsubscribe: '🚫',
  admin:       '👤',
  bounce:      '↩️',
  complaint:   '⚠️',
  other:       '📎',
}

export default function SuppressionPage() {
  const [entries, setEntries]   = useState<SuppressionEntry[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [adding, setAdding]     = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newReason, setNewReason] = useState<SuppressionReason>('admin')
  const [newNotes, setNewNotes] = useState('')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, count } = await supabase
      .from('suppression_list')
      .select('*', { count: 'exact' })
      .order('added_at', { ascending: false })
      .limit(200)
    setEntries((data as SuppressionEntry[]) || [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? entries.filter(e => e.email.toLowerCase().includes(search.toLowerCase()))
    : entries

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setAddError('Please enter a valid email address.')
      return
    }
    setAddLoading(true)
    setAddError('')
    const { error } = await supabase
      .from('suppression_list')
      .upsert(
        { email: newEmail.toLowerCase().trim(), reason: newReason, notes: newNotes || null, source: 'admin' },
        { onConflict: 'email', ignoreDuplicates: true }
      )
    if (error) { setAddError(error.message) }
    else { setNewEmail(''); setNewNotes(''); setAdding(false); load() }
    setAddLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this email from the suppression list? They may receive future promotions.')) return
    setDeleting(id)
    await supabase.from('suppression_list').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
    setTotal(prev => prev - 1)
    setDeleting(null)
  }

  function exportCSV() {
    const headers = ['Email', 'Reason', 'Source', 'Notes', 'Added At']
    const rows = filtered.map(e => [e.email, e.reason, e.source || '', e.notes || '', new Date(e.added_at).toLocaleDateString()])
    const csv  = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `suppression-list-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldOff className="text-red-400" size={24} />
            Suppression List
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Emails here will never receive promotional blasts. {total} suppressed address{total !== 1 ? 'es' : ''}.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          {filtered.length > 0 && (
            <button onClick={exportCSV} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-3 py-2 rounded-lg transition">
              <Download size={13} /> Export CSV
            </button>
          )}
          <button onClick={() => setAdding(!adding)} className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition">
            <Plus size={13} /> Add Email
          </button>
        </div>
      </div>

      {/* Add email form */}
      {adding && (
        <form onSubmit={handleAdd} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5 space-y-4">
          <h2 className="text-white font-semibold text-sm">Manually Add to Suppression List</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-gray-500 text-xs block mb-1.5">Email Address <span className="text-red-400">*</span></label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1.5">Reason</label>
              <select value={newReason} onChange={e => setNewReason(e.target.value as SuppressionReason)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500">
                {(['admin', 'bounce', 'complaint', 'unsubscribe', 'other'] as SuppressionReason[]).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-gray-500 text-xs block mb-1.5">Notes (optional)</label>
            <input
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="e.g. Client requested removal, hard bounce detected..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
          {addError && (
            <div className="flex items-center gap-2 text-red-400 text-xs"><AlertCircle size={13} />{addError}</div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={addLoading}
              className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
              {addLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {addLoading ? 'Adding...' : 'Add to Suppression List'}
            </button>
            <button type="button" onClick={() => { setAdding(false); setAddError('') }}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-4 py-2 rounded-lg transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-600 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <ShieldOff size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">{search ? 'No emails match your search.' : 'No suppressed emails yet.'}</p>
          <p className="text-gray-700 text-xs">
            Run <code className="font-mono text-gray-600">supabase/suppression.sql</code> to enable.
            Emails are added here when customers click the unsubscribe link in a promotion blast.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Email', 'Reason', 'Source', 'Notes', 'Suppressed', ''].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium px-4 py-3 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3">
                    <span className="text-white text-sm font-mono">{entry.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${REASON_COLORS[entry.reason]}`}>
                      {REASON_ICONS[entry.reason]} {entry.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">{entry.source || '—'}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="text-gray-500 text-xs line-clamp-1">{entry.notes || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-xs">
                      {new Date(entry.added_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleting === entry.id}
                      className="text-gray-600 hover:text-red-400 transition disabled:opacity-50"
                      title="Remove from suppression list (re-enables contact)"
                    >
                      {deleting === entry.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {total > 200 && (
            <div className="px-4 py-2.5 border-t border-gray-800 text-gray-600 text-xs">
              Showing first 200 of {total} entries. Export CSV for full list.
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 bg-yellow-950/30 border border-yellow-900/40 rounded-xl p-3">
        <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Compliance Note</p>
        <p className="text-yellow-200/50 text-xs leading-relaxed">
          Suppression is permanent by default. Removing an email from this list means they may receive future promotions.
          Only remove entries if the person has explicitly re-opted-in.
          Run <code className="font-mono text-yellow-300">supabase/suppression.sql</code> to enable this feature.
        </p>
      </div>
    </div>
  )
}
