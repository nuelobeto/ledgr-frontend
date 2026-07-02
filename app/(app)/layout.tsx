import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { hasSessionCookies } from "@/lib/session"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasSessionCookies())) redirect("/auth/login")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
