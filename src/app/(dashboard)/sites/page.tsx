"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Globe, Trash2, Code, BarChart3, Copy, Check, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Site {
  id: string
  domain: string
  api_key: string
  created_at: string
}

export default function SitesPage() {
  const router = useRouter()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)

  useEffect(() => {
    fetchSites()
  }, [])

  async function fetchSites() {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/sites", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.ok) {
        const data = await res.json()
        setSites(data.sites || [])
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteSite(id: string) {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/sites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setSites(sites.filter((site) => site.id !== id))
        setDeleteDialogOpen(null)
      }
    } catch (error) {
      console.error("Failed to delete site:", error)
    }
  }

  async function copyApiKey(apiKey: string, siteId: string) {
    await navigator.clipboard.writeText(apiKey)
    setCopiedId(siteId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sites</h1>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sites</h1>
          <p className="text-sm text-muted-foreground">
            Manage your websites and tracking scripts
          </p>
        </div>
        <Button onClick={() => router.push("/sites/new")} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Site
        </Button>
      </div>

      {/* Sites List */}
      {sites.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No sites yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Add your first website to start tracking analytics
            </p>
            <Button onClick={() => router.push("/sites/new")} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Sites</CardTitle>
            <CardDescription>
              {sites.length} {sites.length === 1 ? 'site' : 'sites'} currently being tracked
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  {/* Left side - Site info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">{site.domain}</h3>
                        <Badge variant="outline" className="text-xs h-5">
                          <span className="relative flex h-1.5 w-1.5 mr-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                          </span>
                          Active
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          Added {new Date(site.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span>•</span>
                        <button
                          onClick={() => copyApiKey(site.api_key, site.id)}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {copiedId === site.id ? (
                            <>
                              <Check className="h-3 w-3" />
                              API Key Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy API Key
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard-2?siteId=${site.id}`)}
                      className="cursor-pointer"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => router.push(`/sites/${site.id}`)}
                          className="cursor-pointer"
                        >
                          <Code className="mr-2 h-4 w-4" />
                          Get Tracking Script
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => copyApiKey(site.api_key, site.id)}
                          className="cursor-pointer"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy API Key
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteDialogOpen(site.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Site
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen !== null} onOpenChange={(open) => !open && setDeleteDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Site?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-semibold">
                {sites.find(s => s.id === deleteDialogOpen)?.domain}
              </span>{' '}
              and all its analytics data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogOpen && deleteSite(deleteDialogOpen)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              Delete Site
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}