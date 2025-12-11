"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAnalyticsContext } from "@/contexts/analytics-context"

// Beautiful blue palette — from vibrant (largest) to soft (smallest)
const COLORS = {
  largest: "hsl(202, 100%, 50%)",   // Bright primary blue (Desktop in your case)
  high:    "hsl(202, 90%, 60%)",
  medium:  "hsl(202, 80%, 70%)",
  low:     "hsl(202, 70%, 80%)",
}

const chartConfig = {
  sessions: { label: "Sessions" },
  desktop: { label: "Desktop", color: COLORS.largest },
  mobile:  { label: "Mobile",  color: COLORS.high },
  tablet:  { label: "Tablet",  color: COLORS.medium },
  laptop:  { label: "Laptop",  color: COLORS.low },
}

export function RevenueBreakdown() {
  const id = "device-breakdown"
  const { devices, loading } = useAnalyticsContext()

  const revenueData = React.useMemo(() => {
    if (!devices || devices.length === 0) return []

    // Sort by count descending to find the largest
    const sortedDevices = [...devices].sort((a, b) => b.value - a.value)

    return devices.map((dev) => {
      const isLargest = dev.name === sortedDevices[0].name
      const isSecond = dev.name === sortedDevices[1]?.name
      const isThird = dev.name === sortedDevices[2]?.name

      let fill = COLORS.low
      if (isLargest) fill = COLORS.largest
      else if (isSecond) fill = COLORS.high
      else if (isThird) fill = COLORS.medium

      const category = dev.name.toLowerCase() as "desktop" | "mobile" | "tablet" | "laptop"

      return {
        category,
        label: dev.name,
        count: dev.value,
        value: parseFloat(dev.percentage),
        fill,
      }
    })
  }, [devices])

  const [activeCategory, setActiveCategory] = React.useState<string>(revenueData[0]?.category || "desktop")
  const activeIndex = revenueData.findIndex((item) => item.category === activeCategory)
  const totalSessions = revenueData.reduce((sum, d) => sum + d.count, 0)

  // Update active category when data changes (e.g. largest changes)
  React.useEffect(() => {
    if (revenueData.length > 0) {
      const largest = revenueData.reduce((prev, current) => 
        (prev.count > current.count) ? prev : current
      )
      setActiveCategory(largest.category)
    }
  }, [revenueData])

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (revenueData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>See what devices your visitors are using</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[350px] items-center justify-center text-muted-foreground">
          No device data yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />

      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
        <div>
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>See what devices your visitors are using</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-[175px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {revenueData.map((item) => (
                <SelectItem key={item.category} value={item.category}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">Export</Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 justify-center pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl">

          {/* Donut Chart */}
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-w-[320px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={revenueData}
                dataKey="count"
                nameKey="label"
                innerRadius={70}
                strokeWidth={5}
                activeIndex={activeIndex}
                activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
              >
                {revenueData.map((entry) => (
                  <cell key={entry.category} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {totalSessions.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-sm">
                            Sessions
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex flex-col justify-center space-y-3">
            {revenueData.map((item) => {
              const isActive = item.category === activeCategory
              return (
                <div
                  key={item.category}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
                    isActive ? "bg-primary/10 ring-2 ring-primary/20" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setActiveCategory(item.category)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="font-medium text-foreground">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{item.count.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{item.value.toFixed(1)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}