import { Logo } from "@/components/common/logo"

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
