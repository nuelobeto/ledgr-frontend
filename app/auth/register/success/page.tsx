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

export default function RegisterSuccessPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MailCheckIcon />
        </EmptyMedia>
        <EmptyTitle>Check your email</EmptyTitle>
        <EmptyDescription>
          If that email isn&apos;t already registered, we&apos;ve sent a confirmation
          link. Click it to activate your account before logging in.
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
