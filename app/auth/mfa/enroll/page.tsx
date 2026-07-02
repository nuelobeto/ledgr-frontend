"use client"

import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { getErrorMessage } from "@/lib/api-error"
import { useMfaEnrollQuery } from "@/features/auth/hooks"

export default function MfaEnrollPage() {
  const router = useRouter()
  const enrollQuery = useMfaEnrollQuery()

  const copyKey = async () => {
    if (!enrollQuery.data) return
    await navigator.clipboard.writeText(enrollQuery.data.sharedKey)
    toast.success("Copied to clipboard.")
  }

  if (enrollQuery.isPending) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Spinner className="size-6" />
        </CardContent>
      </Card>
    )
  }

  if (enrollQuery.isError || !enrollQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Couldn&apos;t start setup</CardTitle>
          <CardDescription>
            {getErrorMessage(
              enrollQuery.error,
              "Something went wrong requesting your authenticator secret."
            )}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button variant="outline" className="w-full" onClick={() => enrollQuery.refetch()}>
            Try again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const { otpauthUri, sharedKey } = enrollQuery.data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up two-factor authentication</CardTitle>
        <CardDescription>
          Scan this with your authenticator app (Google Authenticator, 1Password, Authy...).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center border border-input bg-white p-3">
          <QRCodeSVG value={otpauthUri} size={180} />
        </div>

        <div className="w-full">
          <p className="mb-1 text-xs text-muted-foreground">
            Can&apos;t scan it? Enter this key manually:
          </p>
          <button
            type="button"
            onClick={copyKey}
            className="flex w-full items-center justify-between gap-2 border border-input bg-muted/30 px-2.5 py-1.5 font-mono text-xs"
          >
            <span className="truncate">{sharedKey}</span>
            <CopyIcon className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </div>

        <Button className="w-full" onClick={() => router.push("/auth/mfa/verify")}>
          Continue
        </Button>

        {/* Explicit user action only — useMfaEnrollQuery deliberately never refetches on its
            own (see the hook), because MfaController.Enroll mints a brand new secret on every
            call and would silently invalidate a QR code the user already scanned. */}
        <Button
          type="button"
          variant="link"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => enrollQuery.refetch()}
        >
          Didn&apos;t work? Generate a new code
        </Button>
      </CardContent>
    </Card>
  )
}
