"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAnalyticsContext } from "@/contexts/analytics-context"
import { Button } from "@/components/ui/button"
import { Expand } from "lucide-react"
import ReferrersFullscreen from "./ReferrersFullscreen";

function cleanReferrer(url: string) {
  try {
    const host = new URL(url).hostname.replace("www.", "")
    return host || url
  } catch {
    return url
  }
}

export function ReferrersCard() {
  const { referrals, loading } = useAnalyticsContext()
  const [fullscreen, setFullscreen] = useState(false)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
          <CardDescription>Where your visitors were before arriving</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!referrals || referrals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
          <CardDescription>No referral traffic yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const topFive = referrals.slice(0, 5)
  const total = referrals.reduce((sum, r) => sum + (r.count || 0), 0)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Top Referrers</CardTitle>
            <CardDescription>Where your visitors were before arriving</CardDescription>
          </div>

          {/* Fullscreen button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 flex items-center justify-center"
            onClick={() => setFullscreen(true)}
          >
            <Expand className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {topFive.map((item, index) => {
            const pct = total > 0 ? (item.count / total) * 100 : 0

            return (
              <div
                key={index}
                className="flex items-center p-3 rounded-lg border gap-2"
              >
                {/* Rank bubble */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  #{index + 1}
                </div>

                <div className="flex gap-4 items-center justify-between flex-1 flex-wrap">
                  {/* Referrer info */}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {cleanReferrer(item.referrer)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {item.count} visits
                    </span>
                  </div>

                  {/* Percentage bar */}
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Fullscreen overlay */}
      <ReferrersFullscreen
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        referrers={referrals}
      />
    </>
  )
}
