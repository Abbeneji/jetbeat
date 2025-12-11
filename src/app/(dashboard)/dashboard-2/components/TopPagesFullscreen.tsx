"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TopPagesFullscreen({ open, onClose, pages }) {
  // Hooks must always run
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<
    "visits_desc" | "visits_asc" | "az" | "za" | "pct_desc"
  >("visits_desc");

  // Numeric filters
  const [minVisits, setMinVisits] = useState<number | "">("");
  const [maxVisits, setMaxVisits] = useState<number | "">("");

  const safePages = Array.isArray(pages) ? pages : [];
  const total = safePages.reduce((sum, p) => sum + (p.count || 0), 0);

  // SEARCH
  const searchFiltered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q.trim()) return safePages;

    return safePages.filter((p) =>
      (p.page_url || "").toLowerCase().includes(q)
    );
  }, [query, safePages]);

  // VISIT FILTERING
  const visitFiltered = useMemo(() => {
    return searchFiltered.filter((p) => {
      const count = p.count || 0;

      if (minVisits !== "" && count < minVisits) return false;
      if (maxVisits !== "" && count > maxVisits) return false;

      return true;
    });
  }, [searchFiltered, minVisits, maxVisits]);

  // SORTING
  const sorted = useMemo(() => {
    const arr = [...visitFiltered];

    switch (sortMode) {
      case "visits_desc":
        return arr.sort((a, b) => (b.count || 0) - (a.count || 0));
      case "visits_asc":
        return arr.sort((a, b) => (a.count || 0) - (b.count || 0));
      case "az":
        return arr.sort((a, b) =>
          (a.page_url || "").localeCompare(b.page_url || "")
        );
      case "za":
        return arr.sort((a, b) =>
          (b.page_url || "").localeCompare(a.page_url || "")
        );
      case "pct_desc":
        return arr.sort(
          (a, b) =>
            ((b.count || 0) / total) - ((a.count || 0) / total)
        );
      default:
        return arr;
    }
  }, [visitFiltered, sortMode, total]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1400px] mt-10 mb-10 bg-[#111214] rounded-xl border shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-xl">All Pages</CardTitle>
              <CardDescription>
                Search, filter, and browse all pages
              </CardDescription>
            </div>

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent>
            {/* TOP FILTER ROW */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  className="pl-10 bg-[#1a1b1f] border-white/10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* SORT DROPDOWN */}
              <select
                className="bg-[#1a1b1f] border border-white/10 text-sm rounded-md px-3 py-2"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as any)}
              >
                <option value="visits_desc">Visits — High → Low</option>
                <option value="visits_asc">Visits — Low → High</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="pct_desc">% — High → Low</option>
              </select>
            </div>

            {/* SECOND FILTER ROW */}
            <div className="flex items-center gap-3 mb-6">
              <Input
                type="number"
                min={0}
                placeholder="Min visitors"
                className="bg-[#1a1b1f] border-white/10"
                value={minVisits}
                onChange={(e) =>
                  setMinVisits(e.target.value === "" ? "" : Number(e.target.value))
                }
              />

              <Input
                type="number"
                min={0}
                placeholder="Max visitors"
                className="bg-[#1a1b1f] border-white/10"
                value={maxVisits}
                onChange={(e) =>
                  setMaxVisits(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            {/* PAGE RESULTS */}
            <div className="space-y-3">
              {sorted.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No pages match your filters.
                </p>
              )}

              {sorted.map((item, i) => {
                const url = item.page_url || "";
                const count = item.count || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div
                    key={url + i}
                    className="flex items-center justify-between p-3 rounded-lg border bg-[#1a1b1f] hover:bg-[#222328] transition gap-4"
                  >
                    {/* URL + Rank */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        #{i + 1}
                      </div>

                      <div>
                        <p className="text-sm font-medium truncate max-w-[280px]">
                          {url}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {count} visits
                        </span>
                      </div>
                    </div>

                    {/* Percentage bar */}
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className="flex-1">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
