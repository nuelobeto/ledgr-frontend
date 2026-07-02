import Link from "next/link"

import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const

interface LogoProps {
  /** Where the logo links to. Pass `false` to render a static (non-link) mark, e.g. when
   *  it's already the current page. Defaults to home. */
  href?: string | false
  size?: keyof typeof sizeClasses
  className?: string
}

export function Logo({ href = "/", size = "md", className }: LogoProps) {
  const mark = (
    <span
      data-slot="logo"
      className={cn(
        "font-heading font-medium tracking-tight select-none",
        sizeClasses[size],
        className
      )}
    >
      ledgr
    </span>
  )

  if (!href) return mark

  return (
    <Link
      href={href}
      className="rounded-none outline-none transition-opacity hover:opacity-80 focus-visible:ring-1 focus-visible:ring-ring/50"
    >
      {mark}
    </Link>
  )
}
