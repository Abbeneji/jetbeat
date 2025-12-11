"use client"

import * as React from "react"
import {
  LayoutPanelLeft,
  Settings,
  HelpCircle,
  Shield,
  PanelsTopLeft,
  Layers,
} from "lucide-react"
import Link from "next/link"
import jetbeat_logo from "../../public/jetbeat_logo.png"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Analytics",
          url: "/dashboard-2",
          icon: PanelsTopLeft,
        },
      ],
    },
    {
      label: "Pages",
      items: [
        {
          title: "Sites",
          url: "/sites",
          icon: Layers,
        },
        // ❌ Settings removed from here
        // ❌ FAQs removed from here
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <img src={jetbeat_logo.src} alt="Jetbeat" className="h-10 w-10" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-2xl font-bold tracking-tight">Jetbeat</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      {/* -------------------------- */}
      {/*     NEW BOTTOM NAV LINKS   */}
      {/* -------------------------- */}
      <SidebarFooter>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings/user">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/faqs">
                <HelpCircle className="mr-2 h-4 w-4" />
                FAQs
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* DOMAIN / USER SELECTOR */}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
