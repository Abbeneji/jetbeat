"use client"

import { Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAnalytics } from "@/hooks/use-analytics"
import { useAnalyticsContext } from "@/contexts/analytics-context"

export function TopPages() {
  const { selectedSiteId } = useAnalyticsContext()

  const { topPages, loading } = useAnalytics(selectedSiteId)

  const pages = topPages || []
  const topFive = pages.slice(0, 5)

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most visited pages on your website</CardDescription>
        </div>

        <Button variant="outline" size="sm" className="cursor-pointer">
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && <p className="text-muted-foreground text-sm">Loading...</p>}

        {!loading && topFive.length === 0 && (
          <p className="text-muted-foreground text-sm">No pageview data yet</p>
        )}

        {topFive.map((page, index) => (
          <div key={page.page_url + index} className="flex items-center p-3 rounded-lg border gap-2">
            {/* Rank bubble */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              #{index + 1}
            </div>

            <div className="flex gap-4 items-center justify-between flex-1 flex-wrap">
              {/* Page info */}
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {page.page_url}
                </p>
                <span className="text-xs text-muted-foreground">
                  {page.count} visits
                </span>
              </div>

              {/* Upgraded Percentage Bar (same styling as ReferrersCard) */}
              <div className="flex items-center gap-3 min-w-[140px]">
                <div className="flex-1">
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
                      style={{ width: `${page.percentage}%` }}
                    />
                  </div>
                </div>

                <span className="text-xs text-muted-foreground w-12 text-right">
                  {page.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
