"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Site {
  id: string
  domain: string
  api_key: string
  goal_url: string | null
  created_at: string
}

export default function SiteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [site, setSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const siteId = params.id as string

  useEffect(() => {
    async function fetchSite() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          setSite(data.site)
        }
      } catch (error) {
        console.error("Failed to fetch site:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSite()
  }, [siteId])

  function getScriptCode() {
    if (!site) return ""
    
    // Use window.location.origin for local dev, or your production URL
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : "https://yourapp.com"

    return `<!-- JetBeat Analytics -->
<script
  defer
  src="${baseUrl}/pixel.js"
  data-key="${site.api_key}"
  data-endpoint="${baseUrl}/api/track"
></script>`
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(getScriptCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 px-6">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="flex-1 space-y-6 px-6">
        <div className="text-muted-foreground">Site not found</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/sites")}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{site.domain}</h1>
          <p className="text-muted-foreground">
            Tracking script and site settings
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard-2?siteId=${site.id}`)}
          className="cursor-pointer"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </div>

      <Tabs defaultValue="script" className="space-y-6">
        <TabsList>
          <TabsTrigger value="script" className="cursor-pointer">Tracking Script</TabsTrigger>
          <TabsTrigger value="settings" className="cursor-pointer">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="script" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Install Tracking Script</CardTitle>
              <CardDescription>
                Add this script to your website to start collecting analytics data.
                Place it in the {"<head>"} section of your HTML.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{getScriptCode()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 cursor-pointer"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">Quick Start</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Copy the script code above</li>
                  <li>Paste it into the {"<head>"} section of your website</li>
                  <li>Deploy your changes</li>
                  <li>Visit your website to verify tracking is working</li>
                  <li>Check back here to see your analytics data</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Key</CardTitle>
              <CardDescription>
                Your unique API key for this site. Keep it private.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <code className="bg-muted px-3 py-2 rounded text-sm font-mono">
                {site.api_key}
              </code>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Configure your site tracking preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Domain</p>
                <p className="text-muted-foreground">{site.domain}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Goal URL</p>
                <p className="text-muted-foreground">
                  {site.goal_url || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-muted-foreground">
                  {new Date(site.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}