'use client'

import { useState, useEffect, useCallback } from 'react'

export interface OverviewData {
  live_visitors: number
  total_visitors: number
  total_sessions: number
  avg_duration: number
  previous?: {
    total_visitors: number | null
    total_sessions: number | null
    avg_duration: number | null
  }
  changes?: {
    total_visitors: number | null
    total_sessions: number | null
    avg_duration: number | null
  }
  graph: { date: string; visitors: number }[]
}

export interface Referral {
  referrer: string
  visitors: number
  bounce_rate: number
}

export interface GeoLocation {
  country: string
  city: string | null
  count: number
}

export interface PageView {
  page_url: string
  count: number
}

export function useAnalytics(
  siteId: string | null,
  range: '7d' | '30d' | '90d' | '365d' = '30d'
) {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [geo, setGeo] = useState<GeoLocation[]>([])
  const [topPages, setTopPages] = useState<PageView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!siteId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Fetch ALL analytics endpoints in parallel
      const [
        overviewRes,
        referralsRes,
        geoRes,
        pagesRes
      ] = await Promise.all([
        fetch(`/api/analytics/${siteId}/overview?range=${range}`, { headers }),
        fetch(`/api/analytics/${siteId}/referrals?range=${range}`, { headers }),
        fetch(`/api/analytics/${siteId}/geo?range=${range}`, { headers }),
        fetch(`/api/analytics/${siteId}/pages?range=${range}`, { headers })
      ])

      if (!overviewRes.ok || !referralsRes.ok || !geoRes.ok || !pagesRes.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const [overviewData, referralsData, geoData, pagesData] =
        await Promise.all([
          overviewRes.json(),
          referralsRes.json(),
          geoRes.json(),
          pagesRes.json(),
        ])

      // APPLY RESULTS
      setOverview(overviewData)

      setReferrals(
        Array.isArray(referralsData.referrals)
          ? referralsData.referrals
          : []
      )

      setGeo(
        Array.isArray(geoData.locations)
          ? geoData.locations
          : []
      )

      // Normalize Top Pages
      setTopPages(
        Array.isArray(pagesData.pages)
          ? pagesData.pages
          : []
      )

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [siteId, range])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    overview,
    referrals,
    geo,
    topPages,
    loading,
    error,
    refetch: fetchAnalytics,
  }
}