// src/app/api/sites/[siteId]/route.ts
import { supabaseAdmin } from '../../../lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }  // ← Important!
) {
  try {
    const { siteId } = await params  // ← await here

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: site, error } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single()

    if (error || !site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ site })
  } catch (err) {
    console.error('Error fetching site:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}