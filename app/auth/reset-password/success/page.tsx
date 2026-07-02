import Link from "next/link"
import { CircleCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function ResetPasswordSuccessPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleCheckIcon />
        </EmptyMedia>
        <EmptyTitle>Password reset</EmptyTitle>
        <EmptyDescription>
          You can now log in with your new password.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">Log in</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
