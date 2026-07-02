"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { getErrorMessage } from "@/lib/api-error"
import { useLoginTwoFactorMutation } from "@/features/auth/hooks"
import { mfaCodeSchema, MfaCodeSchemaFormValues } from "@/features/auth/schema"

export default function LoginTwoFactorPage() {
  const router = useRouter()
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const twoFactorMutation = useLoginTwoFactorMutation()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<MfaCodeSchemaFormValues>({
    resolver: zodResolver(mfaCodeSchema),
    defaultValues: { code: "" },
  })

  const toggleRecoveryCode = () => {
    setUseRecoveryCode((v) => !v)
    setValue("code", "")
    clearErrors("code")
  }

  const onSubmit = (values: MfaCodeSchemaFormValues) => {
    // The mfa_token this reads is an httpOnly cookie set by /api/auth/login — nothing to pass
    // in here besides the code itself.
    twoFactorMutation.mutate(values, {
      onSuccess: () => {
        router.push("/")
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "That code didn't work. Please try again."))
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor verification</CardTitle>
        <CardDescription>
          {useRecoveryCode
            ? "Enter one of your unused recovery codes."
            : "Enter the 6-digit code from your authenticator app."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.code}>
              <FieldLabel htmlFor="code">Code</FieldLabel>
              {useRecoveryCode ? (
                <Input
                  id="code"
                  autoComplete="one-time-code"
                  placeholder="xxxxx-xxxxx"
                  aria-invalid={!!errors.code}
                  {...register("code")}
                />
              ) : (
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
              )}
              <FieldError errors={[errors.code]} />
            </Field>

            <Button type="submit" className="mt-2" disabled={twoFactorMutation.isPending}>
              {twoFactorMutation.isPending && <Spinner />}
              Verify
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="button"
          variant="link"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={toggleRecoveryCode}
        >
          {useRecoveryCode ? "Use an authenticator code instead" : "Use a recovery code instead"}
        </Button>
        <p className="text-xs text-muted-foreground">
          <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
            Back to log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
