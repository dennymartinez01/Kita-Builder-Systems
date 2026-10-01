import { NextRequest, NextResponse } from 'next/server'
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from '@/lib/notifications'

// GET /api/notifications?unread_only=true&limit=20&offset=0
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const limit      = searchParams.get('limit')  ? Number(searchParams.get('limit'))  : 50
    const offset     = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0

    const { data, unreadCount, error } = await getNotifications({ unreadOnly, limit, offset })

    if (error) {
      // Table not set up yet — return empty gracefully
      return NextResponse.json({ notifications: [], unread_count: 0, error })
    }

    return NextResponse.json({ notifications: data, unread_count: unreadCount })
  } catch (err: any) {
    return NextResponse.json({ notifications: [], unread_count: 0, error: err.message }, { status: 500 })
  }
}

// POST /api/notifications
// Body: { action: 'mark_read', id: string }
//    or { action: 'mark_all_read' }
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const action = body.action as string

    if (action === 'mark_all_read') {
      const { error } = await markAllRead()
      if (error) throw new Error(error)
      const unread_count = await getUnreadCount()
      return NextResponse.json({ success: true, unread_count })
    }

    if (action === 'mark_read') {
      if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
      const { error } = await markRead(body.id)
      if (error) throw new Error(error)
      const unread_count = await getUnreadCount()
      return NextResponse.json({ success: true, unread_count })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
