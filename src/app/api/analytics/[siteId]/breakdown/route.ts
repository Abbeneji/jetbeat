// src/app/api/analytics/[siteId]/breakdown/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'device' or 'browser'

  try {
    let data: any[] = []
    let total = 0

    if (type === 'browser') {
      const { data: rows } = await supabaseAdmin.rpc('get_browser_breakdown', {
        p_site_id: siteId,
      })
      data = rows || []
    } else {
      // default to device
      const { data: rows } = await supabaseAdmin.rpc('get_device_breakdown', {
        p_site_id: siteId,
      })
      data = rows || []
    }

    total = data.reduce((sum: number, row: any) => sum + Number(row.count), 0)

    const formatted = data.map((row: any) => ({
      name:
        type === 'browser'
          ? row.browser_name
          : row.device_type === 'desktop'
          ? 'Desktop'
          : row.device_type === 'mobile'
          ? 'Mobile'
          : 'Tablet',
      value: Number(row.count),
      percentage: total > 0 ? ((Number(row.count) / total) * 100).toFixed(1) : '0.0',
    }))

    return NextResponse.json({
      items: formatted,
      total,
    })
  } catch (err) {
    console.error('Breakdown error:', err)
    return NextResponse.json({ error: 'Failed to fetch breakdown' }, { status: 500 })
  }
}