"use client";

import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsContext } from "@/contexts/analytics-context";

// Map DB ISO-A2 → TopoJSON numeric ID
const ISO_ALPHA2_TO_NUMERIC: Record<string, string> = {
  FR: "250",
  DE: "276",
  GB: "826",
  UK: "826",
  NL: "528",
  US: "840",
};

// Human-readable country names
const COUNTRY_LABELS: Record<string, string> = {
  FR: "France",
  DE: "Germany",
  GB: "United Kingdom",
  NL: "Netherlands",
  US: "United States",
};

// Normalize DB codes
function normalize(code: string | null | undefined): string | null {
  if (!code) return null;
  const c = code.toUpperCase();
  if (c === "UK") return "GB";
  return c;
}

// Extract visitor count
function getValue(item: any): number {
  return item?.count ?? item?.visits ?? item?.value ?? 0;
}

export function GeoVisitorsMap() {
  const { geo, loading } = useAnalyticsContext();
  const safeGeo = Array.isArray(geo) ? geo : [];
  const [zoom] = useState(1.8);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    country: string;
    visitors: number;
  } | null>(null);

  // Aggregate totals per numeric ID
  const { totalsByNumericId, minCount, maxCount } = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const item of safeGeo) {
      const alpha2 = normalize(item.country);
      if (!alpha2) continue;

      const numeric = ISO_ALPHA2_TO_NUMERIC[alpha2];
      if (!numeric) continue;

      totals[numeric] = (totals[numeric] ?? 0) + getValue(item);
    }

    const counts = Object.values(totals);
    const min = counts.length ? Math.min(...counts) : 0;
    const max = counts.length ? Math.max(...counts) : 0;

    return { totalsByNumericId: totals, minCount: min, maxCount: max };
  }, [safeGeo]);

  // Color fill function
  const fillFor = (numericId: string): string => {
    const count = totalsByNumericId[numericId];
    if (!count || maxCount === 0) return "#17181c";

    const t = (count - minCount) / (maxCount - minCount || 1);
    const alpha = 0.25 + t * 0.75;

    return `rgba(56, 189, 248, ${alpha})`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitor Locations</CardTitle>
          <CardDescription>Where visitors are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Visitor Locations</CardTitle>
        <CardDescription>Where visitors are coming from</CardDescription>
      </CardHeader>

      <CardContent>
        {/* MAP WRAPPER */}
        <div
  className="rounded-xl h-[300px] border relative"
  style={{ backgroundColor: "#17181c" }}
>
          {/* TOOLTIP */}
          {tooltip && (
            <div
              className="absolute px-3 py-2 rounded-md bg-black/80 text-white text-xs shadow-md pointer-events-none"
              style={{
                top: tooltip.y + 10,
                left: tooltip.x + 10,
                zIndex: 50,
              }}
            >
              <div className="font-medium">{tooltip.country}</div>
              <div className="opacity-80">{tooltip.visitors} visitors</div>
            </div>
          )}

          <ComposableMap
            projectionConfig={{ scale: 145 }}
            width={800}
            height={300}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup zoom={zoom} center={[10, 30]}>
              <Geographies geography="/world-110m.json">
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const numericId = geo.id;
                    const alpha2 = Object.keys(ISO_ALPHA2_TO_NUMERIC).find(
                      (k) => ISO_ALPHA2_TO_NUMERIC[k] === numericId
                    );
                    const visitors = totalsByNumericId[numericId] ?? 0;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseMove={(event) => {
                          if (!alpha2) return;
                          setTooltip({
                            x: event.clientX,
                            y: event.clientY - 70,
                            country: COUNTRY_LABELS[alpha2] ?? alpha2,
                            visitors,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: {
                            fill: fillFor(numericId),
                            stroke: "#ffffff22",
                            strokeWidth: 0.6,
                          },
                          hover: {
                            fill: "#38bdf8",
                            stroke: "#ffffff",
                            strokeWidth: 1.0,
                          },
                          pressed: {
                            fill: "#0ea5e9",
                            stroke: "#ffffff",
                            strokeWidth: 1.0,
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* COUNTRY LIST UNDER MAP */}
        <div className="mt-3 space-y-1">
          {safeGeo.map((c: any, i: number) => (
            <div
              key={i}
              className="flex justify-between text-xs text-muted-foreground"
            >
              <span>{normalize(c.country)}</span>
              <span>{c.count} visitors</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
