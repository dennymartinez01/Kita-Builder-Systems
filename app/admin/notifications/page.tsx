'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, RefreshCw, ExternalLink } from 'lucide-react'
import { CATEGORY_ICONS, SEVERITY_COLORS } from '@/lib/events'
import type { AdminNotification } from '@/lib/notifications'

const PAGE_SIZE = 50

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60)   return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)   return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState<'all' | 'unread'>('all')
  const [page, setPage]                   = useState(0)
  const [total, setTotal]                 = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit:        String(PAGE_SIZE),
        offset:       String(page * PAGE_SIZE),
        unread_only:  String(filter === 'unread'),
      })
      const res  = await fetch(`/api/notifications?${params}`)
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unread_count ?? 0)
        // total = we don't expose count yet, derive from array length + offset
        if (data.notifications?.length === PAGE_SIZE) setTotal((page + 2) * PAGE_SIZE)
        else setTotal(page * PAGE_SIZE + (data.notifications?.length ?? 0))
      }
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => { load() }, [load])

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read' }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
    setUnreadCount(0)
  }

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="text-blue-400" size={24} />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Platform events that need your attention.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium px-3 py-2 rounded-lg transition"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0) }}
            className={`text-xs font-medium px-4 py-2 rounded-lg transition capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {f === 'unread' ? `Unread (${unreadCount})` : 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-600 text-sm">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-600 text-sm">
            {filter === 'unread' ? 'All caught up — no unread notifications.' : (
              <div>
                <p className="mb-2">No notifications yet.</p>
                <p className="text-xs text-gray-700">Run <code className="font-mono text-gray-500">supabase/notifications.sql</code> in Supabase to enable this feature.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-800/30 transition group ${!n.read_at ? 'bg-blue-950/10' : ''}`}
              >
                {/* Unread dot */}
                <div className="shrink-0 mt-1.5">
                  {n.read_at
                    ? <div className="w-2 h-2 rounded-full bg-gray-700" />
                    : <div className="w-2 h-2 rounded-full bg-blue-500" />
                  }
                </div>

                {/* Icon */}
                <span className="text-lg shrink-0 mt-0.5">{CATEGORY_ICONS[n.category] ?? '⚙️'}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-0.5">
                    <span className="text-gray-500 text-xs font-mono">{n.event_type}</span>
                    {n.severity !== 'info' && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SEVERITY_COLORS[n.severity]}`}>
                        {n.severity}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${n.read_at ? 'text-gray-400' : 'text-gray-200'}`}>
                    {n.summary}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-gray-600 text-xs">{timeAgo(n.created_at)}</span>
                    {n.client_id && (
                      <Link
                        href={`/admin/clients/${n.client_id}`}
                        className="text-blue-500 hover:text-blue-400 text-xs flex items-center gap-0.5 transition"
                        onClick={e => e.stopPropagation()}
                      >
                        View client <ExternalLink size={10} />
                      </Link>
                    )}
                    {n.site_id && (
                      <Link
                        href={`/admin/sites`}
                        className="text-purple-500 hover:text-purple-400 text-xs flex items-center gap-0.5 transition"
                        onClick={e => e.stopPropagation()}
                      >
                        View site <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Mark read button */}
                {!n.read_at && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="shrink-0 text-gray-600 hover:text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition px-2 py-1 rounded hover:bg-gray-800"
                    title="Mark as read"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-xs px-3 py-2 rounded-lg transition"
          >
            ← Previous
          </button>
          <span className="text-gray-500 text-xs">Page {page + 1}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={notifications.length < PAGE_SIZE || loading}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-xs px-3 py-2 rounded-lg transition"
          >
            Next →
          </button>
        </div>
      )}

      {/* Setup reminder */}
      <div className="mt-4 bg-yellow-950/30 border border-yellow-900/40 rounded-xl p-3">
        <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Setup Required</p>
        <p className="text-yellow-200/50 text-xs">
          Run <code className="font-mono text-yellow-300">supabase/notifications.sql</code> (after events.sql) in your Supabase SQL Editor to enable notifications.
        </p>
      </div>
    </div>
  )
}
