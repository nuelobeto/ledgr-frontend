"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { getErrorMessage } from "@/lib/api-error"
import { useMfaVerifyMutation } from "@/features/auth/hooks"
import { mfaCodeSchema, MfaCodeSchemaFormValues } from "@/features/auth/schema"

export default function MfaVerifyPage() {
  const router = useRouter()
  const verifyMutation = useMfaVerifyMutation()
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaCodeSchemaFormValues>({
    resolver: zodResolver(mfaCodeSchema),
    defaultValues: { code: "" },
  })

  const onSubmit = (values: MfaCodeSchemaFormValues) => {
    verifyMutation.mutate(values, {
      onSuccess: (data) => {
        // Session cookies (forced-enrollment branch only) are already set server-side by
        // /api/auth/mfa/verify. Recovery codes only ever exist in this one response — show
        // them now or they're gone for good.
        setRecoveryCodes(data.recoveryCodes)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Invalid code. Please try again."))
      },
    })
  }

  const copyCodes = async () => {
    if (!recoveryCodes) return
    await navigator.clipboard.writeText(recoveryCodes.join("\n"))
    toast.success("Recovery codes copied.")
  }

  const downloadCodes = () => {
    if (!recoveryCodes) return
    const blob = new Blob([recoveryCodes.join("\n") + "\n"], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ledgr-recovery-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (recoveryCodes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Save your recovery codes</CardTitle>
          <CardDescription>
            Each code works once, if you ever lose access to your authenticator app. Store
            them somewhere safe — this is the only time they&apos;ll be shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 border border-input bg-muted/30 p-3 font-mono text-xs">
            {recoveryCodes.map((code) => (
              <span key={code}>{code}</span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={copyCodes}>
              <CopyIcon /> Copy
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={downloadCodes}>
              <DownloadIcon /> Download
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/")}>
            <CheckIcon /> I&apos;ve saved these, continue
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm your authenticator</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app to finish setup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.code}>
              <FieldLabel htmlFor="code">Code</FieldLabel>
              <Controller
                control={control}
                name="code"
                render={({ field }) => (
                  <InputOTP
                    id="code"
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} aria-invalid={!!errors.code} />
                      <InputOTPSlot index={1} aria-invalid={!!errors.code} />
                      <InputOTPSlot index={2} aria-invalid={!!errors.code} />
                      <InputOTPSlot index={3} aria-invalid={!!errors.code} />
                      <InputOTPSlot index={4} aria-invalid={!!errors.code} />
                      <InputOTPSlot index={5} aria-invalid={!!errors.code} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              <FieldError errors={[errors.code]} />
            </Field>

            <Button type="submit" className="mt-2" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending && <Spinner />}
              Confirm
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
