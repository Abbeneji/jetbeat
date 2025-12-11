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

    // Get date range from query params (default: last 30 days)
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0]

    // Live visitors (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { count: liveVisitors } = await supabaseAdmin
      .from('pageviews')
      .select('visitor_hash', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .gte('timestamp', fiveMinutesAgo)

    // Total unique visitors in date range
    const { data: visitorsData } = await supabaseAdmin
      .from('pageviews')
      .select('visitor_hash')
      .eq('site_id', siteId)
      .gte('timestamp', `${from}T00:00:00`)
      .lte('timestamp', `${to}T23:59:59`)

    const uniqueVisitors = new Set(visitorsData?.map(p => p.visitor_hash)).size

    // Total sessions in date range
    const { data: sessionsData } = await supabaseAdmin
      .from('pageviews')
      .select('session_id')
      .eq('site_id', siteId)
      .gte('timestamp', `${from}T00:00:00`)
      .lte('timestamp', `${to}T23:59:59`)

    const totalSessions = new Set(sessionsData?.map(p => p.session_id)).size

    // Average duration
    const { data: durationData } = await supabaseAdmin
      .from('pageviews')
      .select('duration')
      .eq('site_id', siteId)
      .gte('timestamp', `${from}T00:00:00`)
      .lte('timestamp', `${to}T23:59:59`)

    const avgDuration = durationData?.length
      ? Math.round(durationData.reduce((sum, p) => sum + (p.duration || 0), 0) / durationData.length)
      : 0

    // Graph data (visitors per day)
    const { data: graphData } = await supabaseAdmin
      .from('pageviews')
      .select('timestamp, visitor_hash')
      .eq('site_id', siteId)
      .gte('timestamp', `${from}T00:00:00`)
      .lte('timestamp', `${to}T23:59:59`)
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
      total_visitors: uniqueVisitors,
      total_sessions: totalSessions,
      avg_duration: avgDuration,
      graph
    })
  } catch (error) {
    console.error('Overview error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}