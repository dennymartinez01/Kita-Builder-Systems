import { NextRequest, NextResponse } from 'next/server'
import { queryEvents } from '@/lib/events'

// GET /api/events?category=&severity=&from=&to=&limit=&offset=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    const { data, count, error } = await queryEvents({
      category:  searchParams.get('category')  || undefined,
      severity:  searchParams.get('severity')  || undefined,
      client_id: searchParams.get('client_id') || undefined,
      site_id:   searchParams.get('site_id')   || undefined,
      from:      searchParams.get('from')      || undefined,
      to:        searchParams.get('to')        || undefined,
      limit:     searchParams.get('limit')  ? Number(searchParams.get('limit'))  : 50,
      offset:    searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    })

    if (error) {
      // Table doesn't exist yet — return empty gracefully
      return NextResponse.json({ events: [], total: 0, error })
    }

    return NextResponse.json({ events: data, total: count })
  } catch (err: any) {
    return NextResponse.json({ events: [], total: 0, error: err.message }, { status: 500 })
  }
}
