"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewSitePage() {
  const router = useRouter()
  const [domain, setDomain] = useState("")
  const [goalUrl, setGoalUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
          goal_url: goalUrl || null 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create site")
      }

      // Redirect to the new site's page to show the script
      router.push(`/sites/${data.site.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Site</h1>
          <p className="text-muted-foreground">
            Add a website to start tracking analytics
          </p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Site Details</CardTitle>
          <CardDescription>
            Enter your website domain to generate a tracking script
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter your domain without http:// or https://
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalUrl">Goal URL (optional)</Label>
              <Input
                id="goalUrl"
                placeholder="/thank-you or /checkout/success"
                value={goalUrl}
                onChange={(e) => setGoalUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Track conversions when visitors reach this page
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="cursor-pointer">
                {loading ? "Creating..." : "Create Site"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}