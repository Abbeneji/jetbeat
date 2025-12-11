"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  EllipsisVertical,
  Globe,
  Settings,
  Check,
} from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface Site {
  id: string
  domain: string
  user_id: string
  created_at: string
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSites = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/sites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          setSites(data.sites || [])
          
          // Get selected site from localStorage or use first site
          const savedSiteId = localStorage.getItem("selectedSiteId")
          if (savedSiteId && data.sites) {
            const saved = data.sites.find((s: Site) => s.id === savedSiteId)
            setSelectedSite(saved || data.sites[0] || null)
          } else {
            setSelectedSite(data.sites?.[0] || null)
          }
        }
      } catch (error) {
        console.error("Failed to fetch sites:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSites()
  }, [])

  const handleSiteChange = (site: Site) => {
    setSelectedSite(site)
    localStorage.setItem("selectedSiteId", site.id)
    // Optionally refresh the page or emit an event to update dashboard data
    window.location.reload()
  }

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Globe className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (sites.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/sites/new">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Plus className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Add Website</span>
                <span className="text-muted-foreground truncate text-xs">
                  Get started
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!selectedSite) {
    setSelectedSite(sites[0])
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{selectedSite.domain}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {sites.length} {sites.length === 1 ? 'website' : 'websites'}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Current Website
            </DropdownMenuLabel>
            {sites.map((site) => (
              <DropdownMenuItem
                key={site.id}
                onClick={() => handleSiteChange(site)}
                className="cursor-pointer"
              >
                <Globe className="mr-2 h-4 w-4" />
                <span className="flex-1">{site.domain}</span>
                {selectedSite.id === site.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/sites/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Website
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/sites/${selectedSite.id}`}>
                <Settings className="mr-2 h-4 w-4" />
                Site Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}