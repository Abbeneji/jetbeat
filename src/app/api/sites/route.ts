import { supabaseAdmin } from '../../lib/supabase-server'
import { getUser } from '../../lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/sites - List user's sites
export async function GET(request: NextRequest) {
  const user = await getUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('sites')
    .select('id, domain, api_key, goal_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Sites fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
  }

  return NextResponse.json({ sites: data })
}

// POST /api/sites - Create a new site
export async function POST(request: NextRequest) {
  const user = await getUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { domain, goal_url } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('sites')
      .insert({
        user_id: user.id,
        domain,
        goal_url: goal_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Site creation error:', error)
      return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
    }

    return NextResponse.json({ site: data }, { status: 201 })
  } catch (error) {
    console.error('Site creation error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}