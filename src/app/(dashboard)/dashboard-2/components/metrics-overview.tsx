"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target,
  Activity
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

export function MetricsOverview() {
  const { overview, loading } = useAnalyticsContext()

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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

  const metrics = [
    {
      title: "Live Visitors",
      value: overview?.live_visitors ?? 0,
      description: "Currently on your site",
      change: "+12%",
      trend: "up" as const,
      icon: Activity,
      footer: "Real-time count",
      subfooter: "Updates every 5 minutes"
    },
    {
      title: "Total Visitors",
      value: overview?.total_visitors?.toLocaleString() ?? "0",
      description: "Unique visitors",
      change: "+5.2%", 
      trend: "up" as const,
      icon: Users,
      footer: "Up 5.2% from last period",
      subfooter: "Visitors steadily increasing"
    },
    {
      title: "Avg Time on Page",
      value: formatDuration(overview?.avg_duration ?? 0),
      description: "Average session duration",
      change: "+4.9%",
      trend: "up" as const, 
      icon: Clock,
      footer: "Up 4.9% from last period",
      subfooter: "Users are more engaged"
    },
    {
      title: "Total Sessions",
      value: overview?.total_sessions?.toLocaleString() ?? "0",
      description: "Total page views",
      change: "+8.3%",
      trend: "up" as const,
      icon: Target,
      footer: "Steady performance increase",
      subfooter: "Healthy session count"
    },
  ]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        
        return (
          <Card key={metric.title} className="cursor-pointer">
            <CardHeader>
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon className="h-4 w-4" />
                  {metric.change}
                </Badge>
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