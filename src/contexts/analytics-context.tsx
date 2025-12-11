// src/contexts/analytics-context.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSites, Site } from '@/hooks/use-sites'

type TimeRange = '7d' | '30d' | '90d' | '365d'

export interface BreakdownItem {
  name: string
  value: number
  percentage: string
}

interface AnalyticsContextType {
  // Sites
  sites: Site[]
  sitesLoading: boolean
  selectedSiteId: string | null
  setSelectedSiteId: (id: string | null) => void
  
  // Time range
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void
  
  // Analytics data
  overview: any
  referrals: any[]
  geo: any[]
  devices: BreakdownItem[]
  browsers: BreakdownItem[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  
  const { sites, loading: sitesLoading } = useSites()

  // === New state for breakdown data ===
  const [devices, setDevices] = useState<BreakdownItem[]>([])
  const [browsers, setBrowsers] = useState<BreakdownItem[]>([])
  const [breakdownLoading, setBreakdownLoading] = useState(false)

  // Reuse your existing hook for main data
  const { overview, referrals, geo, loading: mainLoading, error, refetch: refetchMain } = 
    typeof window !== 'undefined' 
      ? require('@/hooks/use-analytics').useAnalytics(selectedSiteId, timeRange)
      : { overview: null, referrals: [], geo: [], loading: true, error: null, refetch: () => {} }

  // Auto-select first site
  useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(sites[0].id)
    }
  }, [sites, selectedSiteId])

  // === Fetch Device & Browser Breakdown ===
  useEffect(() => {
    if (!selectedSiteId) {
      setDevices([])
      setBrowsers([])
      return
    }

    async function fetchBreakdown() {
      setBreakdownLoading(true)
      const token = localStorage.getItem('token')
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

      try {
        const [devicesRes, browsersRes] = await Promise.all([
          fetch(`/api/analytics/${selectedSiteId}/breakdown?type=device`, { headers }),
          fetch(`/api/analytics/${selectedSiteId}/breakdown?type=browser`, { headers }),
        ])

        const [devicesData, browsersData] = await Promise.all([
          devicesRes.ok ? devicesRes.json() : { items: [], total: 0 },
          browsersRes.ok ? browsersRes.json() : { items: [], total: 0 },
        ])

        setDevices(devicesData.items || [])
        setBrowsers(browsersData.items || [])
      } catch (err) {
        console.error('Failed to load breakdown:', err)
        setDevices([])
        setBrowsers([])
      } finally {
        setBreakdownLoading(false)
      }
    }

    fetchBreakdown()
  }, [selectedSiteId, timeRange]) // Re-fetch on time range change too!

  // Unified loading state
  const loading = mainLoading || breakdownLoading

  // Unified refetch
  const refetch = () => {
    refetchMain()
    // Trigger breakdown refetch via dependency
    setSelectedSiteId(selectedSiteId)
  }

  return (
    <AnalyticsContext.Provider value={{
      sites,
      sitesLoading,
      selectedSiteId,
      setSelectedSiteId,
      timeRange,
      setTimeRange,
      overview,
      referrals,
      geo,
      devices,
      browsers,
      loading,
      error,
      refetch,
    }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider')
  }
  return context
}