import Link from "next/link"
import { MailCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function ForgotPasswordSuccessPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MailCheckIcon />
        </EmptyMedia>
        <EmptyTitle>Check your email</EmptyTitle>
        <EmptyDescription>
          If an account exists for that email, we&apos;ve sent a link to reset your
          password. The link expires after a while, so use it soon.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">Back to log in</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
