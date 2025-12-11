"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target,
  Activity,
  UserMinus
} from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAnalyticsContext } from "@/contexts/analytics-context"

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

function calculateChange(current: number, previous: number | undefined): { change: string; trend: 'up' | 'down' | 'neutral' } {
  if (!previous || previous === 0) {
    return { change: "N/A", trend: "neutral" }
  }
  
  const percentChange = ((current - previous) / previous) * 100
  const absChange = Math.abs(percentChange)
  const sign = percentChange >= 0 ? "+" : "-"
  
  return {
    change: `${sign}${absChange.toFixed(1)}%`,
    trend: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral"
  }
}

export function MetricsOverview() {
  const { overview, loading } = useAnalyticsContext()

  
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // Calculate percentage changes dynamically
  const visitorsChange = calculateChange(overview?.total_visitors ?? 0, overview?.prev_total_visitors)
  const sessionsChange = calculateChange(overview?.total_sessions ?? 0, overview?.prev_total_sessions)
  const durationChange = calculateChange(overview?.avg_duration ?? 0, overview?.prev_avg_duration)
  const churnChange = calculateChange(overview?.churn_rate ?? 0, overview?.prev_churn_rate)

  const metrics = [
    {
      title: "Live Visitors",
      value: overview?.live_visitors ?? 0,
      description: "Currently on your site",
      change: "+12%",
      trend: "up" as const,
      icon: Activity,
      footer: "Real-time count",
      subfooter: "Updates every 5 minutes",
      isLive: true
    },
    {
      title: "Total Visitors",
      value: overview?.total_visitors?.toLocaleString() ?? "0",
      description: "Unique visitors",
      change: visitorsChange.change,
      trend: visitorsChange.trend,
      icon: Users,
      footer: visitorsChange.change !== "N/A" 
        ? `${visitorsChange.change} from last period`
        : "No previous data available",
      subfooter: visitorsChange.trend === "up" 
        ? "Visitors steadily increasing"
        : visitorsChange.trend === "down"
        ? "Visitors declining"
        : "Tracking visitor trends"
    },
    {
      title: "Total Sessions",
      value: overview?.total_sessions?.toLocaleString() ?? "0",
      description: "Total page views",
      change: sessionsChange.change,
      trend: sessionsChange.trend,
      icon: Target,
      footer: sessionsChange.change !== "N/A"
        ? `${sessionsChange.change} from last period`
        : "No previous data available",
      subfooter: sessionsChange.trend === "up"
        ? "Steady performance increase"
        : sessionsChange.trend === "down"
        ? "Sessions declining"
        : "Healthy session count"
    },
    {
      title: "Avg Time on Page",
      value: formatDuration(overview?.avg_duration ?? 0),
      description: "Average session duration",
      change: durationChange.change,
      trend: durationChange.trend,
      icon: Clock,
      footer: durationChange.change !== "N/A"
        ? `${durationChange.change} from last period`
        : "No previous data available",
      subfooter: durationChange.trend === "up"
        ? "Users are more engaged"
        : durationChange.trend === "down"
        ? "Engagement decreasing"
        : "Monitoring engagement"
    },
    {
      title: "Churn Rate",
      value: `${(overview?.churn_rate ?? 0).toFixed(1)}%`,
      description: "Visitors who leave quickly",
      change: churnChange.change,
      trend: churnChange.trend,
      icon: UserMinus,
      footer: churnChange.change !== "N/A"
        ? `${churnChange.change} from last period`
        : "No previous data available",
      subfooter: churnChange.trend === "down"
        ? "Improved user retention"
        : churnChange.trend === "up"
        ? "Retention needs attention"
        : "Monitoring retention"
    }
  ]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-5">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : null
        
        return (
          <Card key={metric.title} className="cursor-pointer">
            <CardHeader>
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <CardAction>
                {metric.isLive ? (
                  <Badge variant="outline" className="gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                    LIVE
                  </Badge>
                ) : metric.change !== "N/A" && TrendIcon ? (
                  <Badge variant="outline">
                    <TrendIcon className="h-4 w-4" />
                    {metric.change}
                  </Badge>
                ) : null}
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {metric.footer}
              </div>
              <div className="text-muted-foreground">
                {metric.subfooter}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}