import { supabase } from '../../lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get API key from query params
    const apiKey = request.nextUrl.searchParams.get('key')
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }

    // Validate API key and get site (including goal_url)
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, goal_url')
      .eq('api_key', apiKey)
      .single()

    if (siteError || !site) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Parse body
    const body = await request.json()
    const { visitor_hash, session_id, referrer, page_url, duration } = body

    // Get user agent from headers
    const userAgent = request.headers.get('user-agent') || ''

    // Check if this pageview is a goal
    const isGoal = site.goal_url ? page_url === site.goal_url : false

    // Insert pageview
    const { error: insertError } = await supabase
      .from('pageviews')
      .insert({
        site_id: site.id,
        visitor_hash,
        session_id,
        referrer,
        user_agent: userAgent,
        country: null,
        city: null,
        page_url,
        duration: duration || 0,
        is_goal: isGoal,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Track error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}