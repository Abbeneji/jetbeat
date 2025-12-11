'use client'

import { useState, useEffect } from 'react'

export interface Site {
  id: string
  domain: string
  api_key: string
  goal_url: string | null
  created_at: string
}

export function useSites() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSites() {
      try {
        const token = localStorage.getItem('token')

        const res = await fetch('/api/sites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch sites')
        }

        const data = await res.json()
        setSites(data.sites || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSites()
  }, [])

  return { sites, loading, error }
}