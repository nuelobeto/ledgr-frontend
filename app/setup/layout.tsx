import { redirect } from "next/navigation"

import { Logo } from "@/components/common/logo"
import { hasSessionCookies } from "@/lib/session"

export default async function SetupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasSessionCookies())) redirect("/auth/login")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Logo href={false} />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
