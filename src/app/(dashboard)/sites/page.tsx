"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Globe, Trash2, Code, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
      }
    } catch (error) {
      console.error("Failed to delete site:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sites</h1>
        </div>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sites</h1>
          <p className="text-muted-foreground">
            Manage your websites and tracking scripts
          </p>
        </div>
        <Button onClick={() => router.push("/sites/new")} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Site
        </Button>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sites yet</h3>
            <p className="text-muted-foreground text-center mb-4">
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
              Click on a site to view analytics and get the tracking script
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.domain}</TableCell>
                    <TableCell>
                      {new Date(site.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/sites/${site.id}`)}
                          className="cursor-pointer"
                        >
                          <Code className="mr-2 h-4 w-4" />
                          Get Script
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard-2?siteId=${site.id}`)}
                          className="cursor-pointer"
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete site?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {site.domain} and all its
                                analytics data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSite(site.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}