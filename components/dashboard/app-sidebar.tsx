"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Logo } from "@/components/common/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useCurrentUserQuery } from "@/features/users/hooks"
import { NAV_ITEMS } from "./nav-items"

function isItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  // Shares the same cache entry DashboardHeader reads — no extra request just to check roles.
  const currentUserQuery = useCurrentUserQuery()
  const isAdmin = currentUserQuery.data?.roles.includes("Admin") ?? false

  const items = NAV_ITEMS.filter((item) => !item.hidden && (!item.adminOnly || isAdmin))

  // The mobile sidebar renders as an overlay Sheet (see Sidebar in ui/sidebar.tsx) that stays
  // mounted across client-side navigations, so it doesn't naturally close just because the
  // route changed. `openMobile` belongs to SidebarProvider, not this component, so this has
  // to be a real effect (synchronizing external state) rather than the render-time-adjustment
  // trick used elsewhere for local state — doing this during render updates a different
  // component while AppSidebar is rendering, which is exactly what React warned about here.
  useEffect(() => {
    if (isMobile) setOpenMobile(false)
  }, [pathname, isMobile, setOpenMobile])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(pathname, item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
