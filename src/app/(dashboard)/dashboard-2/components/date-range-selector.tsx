"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "lucide-react"

type TimeRange = '7d' | '30d' | '90d' | '365d'

interface DateRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

const rangeLabels: Record<TimeRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '365d': 'Last year',
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          {rangeLabels[value]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(rangeLabels) as [TimeRange, string][]).map(([range, label]) => (
          <DropdownMenuItem
            key={range}
            onClick={() => onChange(range)}
            className={value === range ? "bg-accent" : ""}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}