"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { AnalyticsProvider, useAnalyticsContext } from "@/contexts/analytics-context"

import { MetricsOverview } from "./components/metrics-overview"
import { SalesChart } from "./components/sales-chart"
import { RecentTransactions } from "./components/recent-transactions"
import { TopProducts } from "./components/top-products"
import { CustomerInsights } from "./components/customer-insights"
import { QuickActions } from "./components/quick-actions"
import { RevenueBreakdown } from "./components/revenue-breakdown"
import { GeoVisitorsMap } from "./components/geo-visitors"
import { ReferrersCard } from "./components/referrers-card"
import { TopPages } from "./components/top-pages"

export default function Dashboard2() {
  return (
    <AnalyticsProvider>
      <DashboardShell />
    </AnalyticsProvider>
  )
}

function DashboardShell() {
  const router = useRouter()
  const {
    sites,
    sitesLoading,
    selectedSiteId,
    setSelectedSiteId,
    overview,
    loading,
  } = useAnalyticsContext()

  const [authChecked, setAuthChecked] = useState(false)

  // -------------------------------------------------
  // 1. AUTH CHECK
  // -------------------------------------------------
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      router.replace("/sign-in-2")
      return
    }
    setAuthChecked(true)
  }, [router])

  // -------------------------------------------------
  // 2. AUTO-SELECT FIRST SITE (FIX FOR THE ERROR)
  // -------------------------------------------------
  useEffect(() => {
    if (!sitesLoading && sites && sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(sites[0].id)
    }
  }, [sites, sitesLoading, selectedSiteId, setSelectedSiteId])

  // -------------------------------------------------
  // 3. LOADING STATES (KEEP ORIGINAL SKELETONS)
  // -------------------------------------------------
  if (!authChecked || sitesLoading || (!selectedSiteId && sites.length > 0)) {
    return <DashboardSkeletonOriginal />
  }

  // -------------------------------------------------
  // 4. NO SITES PRESENT
  // -------------------------------------------------
  if (sites.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-2xl font-semibold">No website connected yet</h1>
        <p className="text-muted-foreground max-w-md text-center">
          Add your first site to begin collecting analytics.
        </p>
      </div>
    )
  }

  // -------------------------------------------------
  // 5. CORRECTED "NO DATA YET" CONDITION
  // -------------------------------------------------
  const showNoDataBanner =
    !loading &&
    overview &&
    (overview.totalSessions === 0 ||
      overview.totalVisitors === 0 ||
      overview.totalPageviews === 0)

  // -------------------------------------------------
  // 6. RENDER DASHBOARD (UNCHANGED)
  // -------------------------------------------------
  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      {showNoDataBanner && (
        <div className="rounded-xl border border-border p-4 bg-card">
          <h2 className="font-semibold mb-1">No analytics data yet</h2>
          <p className="text-muted-foreground text-sm">
            Install the JetBeat script on your website to start collecting data.
          </p>
        </div>
      )}

      <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your web performance and key metrics in real-time
          </p>
        </div>
        <QuickActions />
      </div>

      <div className="@container/main space-y-6">
        <MetricsOverview />

        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <SalesChart />
          <RevenueBreakdown />
        </div>

        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <ReferrersCard />
          <TopPages />
        </div>

        <GeoVisitorsMap />
      </div>
    </div>
  )
}

/* ---------------------------------------------------
   Your ORIGINAL skeleton layout (unchanged)
--------------------------------------------------- */
function DashboardSkeletonOriginal() {
  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
        <div className="rounded-xl bg-muted h-36"></div>
        <div className="rounded-xl bg-muted h-36"></div>
      </div>

      <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
        <div className="rounded-xl bg-muted h-80"></div>
        <div className="rounded-xl bg-muted h-80"></div>
      </div>

      <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
        <div className="rounded-xl bg-muted h-80"></div>
        <div className="rounded-xl bg-muted h-80"></div>
      </div>
    </div>
  )
}
