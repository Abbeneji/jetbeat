"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAnalyticsContext } from "@/contexts/analytics-context"
import { Link2 } from "lucide-react"

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

  // 🔥 Compute total visits so percentage is correct
  const total = referrals.reduce((sum, r) => sum + (r.count || 0), 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Top Referrers</CardTitle>
          <CardDescription>Where your visitors were before arriving</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {topFive.map((item, index) => {
          const pct = total > 0 ? (item.count / total) * 100 : 0

          return (
            <div
              key={index}
              className="flex items-center p-3 rounded-lg border gap-2"
            >
              {/* Rank badge */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                #{index + 1}
              </div>

              <div className="flex gap-2 items-center justify-between flex-1 flex-wrap">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {cleanReferrer(item.referrer)}
                    </p>

                    {/* <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      Referrer
                    </Badge> */}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {item.count} visits
                  </span>
                </div>

                {/* Percentage + Progress */}
                <div className="text-right space-y-1">
                  <Progress value={pct} className="w-20 h-1" />
                  <span className="text-xs text-muted-foreground">
                    {pct.toFixed(1)}% of traffic
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
