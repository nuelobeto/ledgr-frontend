import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRightIcon,
  LayoutDashboardIcon,
  RepeatIcon,
  ShieldCheckIcon,
  TagsIcon,
  UserIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  /** AuditController is [Authorize(Roles = "Admin")] on the backend — this just hides the
   *  link for everyone else in the sidebar/header; the real enforcement stays server-side. */
  adminOnly?: boolean
  /** Still contributes to DashboardHeader's pathname -> title lookup, but AppSidebar filters
   *  it out of the rendered menu — for pages reached through another entry point (e.g. the
   *  avatar dropdown's "My Account") rather than primary navigation. */
  hidden?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { title: "Transactions", href: "/transactions", icon: ArrowLeftRightIcon },
  { title: "Categories", href: "/categories", icon: TagsIcon },
  { title: "Recurring", href: "/recurring", icon: RepeatIcon },
  { title: "Audit Log", href: "/audit", icon: ShieldCheckIcon, adminOnly: true },
  { title: "Account", href: "/account", icon: UserIcon, hidden: true },
]
