import Link from "next/link"
import { CircleCheckIcon, CircleXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

// Landed on by the browser directly off the ASP.NET redirect in AuthController.ConfirmEmail
// (a GET clicked from the confirmation email, not an API call from this app) — so this reads
// the outcome from the query string rather than calling anything itself.
export default async function EmailConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const success = status === "success"

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {success ? <CircleCheckIcon /> : <CircleXIcon />}
        </EmptyMedia>
        <EmptyTitle>{success ? "Email confirmed" : "Link invalid or expired"}</EmptyTitle>
        <EmptyDescription>
          {success
            ? "Your email is confirmed. You can now log in."
            : "This confirmation link is invalid or has expired. Register again to get a new one."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline" className="w-full">
          <Link href={success ? "/auth/login" : "/auth/register"}>
            {success ? "Log in" : "Back to register"}
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
