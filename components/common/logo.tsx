import Link from "next/link"

import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-2xl",
} as const

interface LogoProps {
  /** Where the logo links to. Pass `false` to render a static (non-link) mark, e.g. when
   *  it's already the current page. Defaults to home. */
  href?: string | false
  size?: keyof typeof sizeClasses
  className?: string
}

export function Logo({ href = "/", size = "lg", className }: LogoProps) {
  const mark = (
    <span
      data-slot="logo"
      className={cn(
        "font-heading font-bold tracking-tight text-primary select-none",
        sizeClasses[size],
        className
      )}
    >
      Ledgr.
    </span>
  )

  if (!href) return mark

  return (
    <Link
      href={href}
      className="rounded-none transition-opacity outline-none hover:opacity-80 focus-visible:ring-1 focus-visible:ring-ring/50"
    >
      {mark}
    </Link>
  )
}
