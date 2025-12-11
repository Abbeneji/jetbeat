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

    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0]

    const { data } = await supabaseAdmin
      .from('pageviews')
      .select('country, city')
      .eq('site_id', siteId)
      .gte('timestamp', `${from}T00:00:00`)
      .lte('timestamp', `${to}T23:59:59`)

    // Group by country/city
    const locationStats: Record<string, number> = {}
    data?.forEach(p => {
      const location = p.country 
        ? `${p.country}${p.city ? ` - ${p.city}` : ''}`
        : 'Unknown'
      locationStats[location] = (locationStats[location] || 0) + 1
    })

    const locations = Object.entries(locationStats)
      .map(([location, count]) => {
        const [country, city] = location.split(' - ')
        return { country, city: city || null, count }
      })
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Geo error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}