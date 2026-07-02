"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOutIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/common/user-avatar"
import { getErrorMessage } from "@/lib/api-error"
import { useLogoutMutation } from "@/features/auth/hooks"
import { useAuthGuard } from "@/features/users/hooks"
import { NAV_ITEMS } from "./nav-items"

function pageTitle(pathname: string) {
  const match = NAV_ITEMS.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  )
  return match?.title ?? "Dashboard"
}

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  // Enforces both the session check AND the mandatory profile-setup gate (redirects to
  // /auth/login or /setup as needed) — see useAuthGuard in features/users/hooks.ts.
  const currentUserQuery = useAuthGuard()
  const logoutMutation = useLogoutMutation()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/auth/login")
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, "Couldn't log out. Please try again.")
        )
      },
    })
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-12" />
      <h1 className="flex-1 truncate font-heading text-sm font-medium">
        {pageTitle(pathname)}
      </h1>

      {currentUserQuery.isPending ? (
        <Skeleton className="size-8 rounded-full" />
      ) : currentUserQuery.data ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring/50">
            <UserAvatar user={currentUserQuery.data} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
              {currentUserQuery.data.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">
                <UserIcon /> My Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={logoutMutation.isPending}
              onClick={handleLogout}
            >
              <LogOutIcon /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </header>
  )
}
