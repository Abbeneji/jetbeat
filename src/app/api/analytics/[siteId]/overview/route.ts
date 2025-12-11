import { supabaseAdmin } from '../../../../lib/supabase-server'
import { getUser } from '../../../../lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { siteId } = await params

    // Verify user owns this site
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single()

    if (siteError || !site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // ============================================
    // 🔧 FIX: Handle 'range' parameter from frontend
    // ============================================
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '30d' // Get the range parameter
    
    // Convert range to days
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '365d': 365,
    }
    const rangeDays = daysMap[range] || 30

    // Calculate date range based on 'range' parameter
    const toDate = new Date() // Now
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - rangeDays)

    // Format dates
    const from = fromDate.toISOString().split('T')[0]
    const to = toDate.toISOString().split('T')[0]
    // ============================================

    const DAY_MS = 24 * 60 * 60 * 1000
    const parseDate = (date: string) => new Date(`${date}T00:00:00`)
    const parsedFromDate = parseDate(from)
    const parsedToDate = new Date(`${to}T23:59:59`)

    const actualRangeDays = Math.max(1, Math.round((parsedToDate.getTime() - parsedFromDate.getTime()) / DAY_MS) + 1)

    // Previous period uses the same length right before the current range
    const prevPeriodEnd = new Date(parsedFromDate.getTime() - DAY_MS)
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - (actualRangeDays - 1) * DAY_MS)

    const formatRangeDate = (date: Date, endOfDay = false) =>
      `${date.toISOString().split('T')[0]}${endOfDay ? 'T23:59:59' : 'T00:00:00'}`

    const currentRange = {
      from: formatRangeDate(parsedFromDate),
      to: formatRangeDate(parsedToDate, true),
    }

    const previousRange = {
      from: formatRangeDate(prevPeriodStart),
      to: formatRangeDate(prevPeriodEnd, true),
    }

    // Live visitors (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { count: liveVisitors } = await supabaseAdmin
      .from('pageviews')
      .select('visitor_hash', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .gte('timestamp', fiveMinutesAgo)

    const fetchRangeStats = async (range: { from: string; to: string }) => {
      // Total unique visitors in date range
      const { data: visitorsData } = await supabaseAdmin
        .from('pageviews')
        .select('visitor_hash')
        .eq('site_id', siteId)
        .gte('timestamp', range.from)
        .lte('timestamp', range.to)

      const uniqueVisitors = new Set(visitorsData?.map(p => p.visitor_hash)).size

      // Total sessions in date range
      const { data: sessionsData } = await supabaseAdmin
        .from('pageviews')
        .select('session_id')
        .eq('site_id', siteId)
        .gte('timestamp', range.from)
        .lte('timestamp', range.to)

      const totalSessions = new Set(sessionsData?.map(p => p.session_id)).size

      // Average duration
      const { data: durationData } = await supabaseAdmin
        .from('pageviews')
        .select('duration')
        .eq('site_id', siteId)
        .gte('timestamp', range.from)
        .lte('timestamp', range.to)

      const avgDuration = durationData?.length
        ? Math.round(durationData.reduce((sum, p) => sum + (p.duration || 0), 0) / durationData.length)
        : 0

      return {
        total_visitors: uniqueVisitors,
        total_sessions: totalSessions,
        avg_duration: avgDuration,
      }
    }

    const calculateChange = (current: number, previous: number) => {
      if (!previous) return null
      const delta = ((current - previous) / previous) * 100
      return Math.round(delta * 10) / 10
    }

    const [currentStats, previousStats] = await Promise.all([
      fetchRangeStats(currentRange),
      fetchRangeStats(previousRange),
    ])

    // Graph data (visitors per day)
    const { data: graphData } = await supabaseAdmin
      .from('pageviews')
      .select('timestamp, visitor_hash')
      .eq('site_id', siteId)
      .gte('timestamp', currentRange.from)
      .lte('timestamp', currentRange.to)
      .order('timestamp', { ascending: true })

    // Group by date
    const visitorsByDate: Record<string, Set<string>> = {}
    graphData?.forEach(p => {
      const date = p.timestamp.split('T')[0]
      if (!visitorsByDate[date]) visitorsByDate[date] = new Set()
      visitorsByDate[date].add(p.visitor_hash)
    })

    const graph = Object.entries(visitorsByDate).map(([date, visitors]) => ({
      date,
      visitors: visitors.size
    }))

    return NextResponse.json({
      live_visitors: liveVisitors || 0,
      ...currentStats,
      previous: previousStats,
      changes: {
        total_visitors: calculateChange(currentStats.total_visitors, previousStats.total_visitors),
        total_sessions: calculateChange(currentStats.total_sessions, previousStats.total_sessions),
        avg_duration: calculateChange(currentStats.avg_duration, previousStats.avg_duration),
      },
      graph
    })
  } catch (error) {
    console.error('Overview error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}