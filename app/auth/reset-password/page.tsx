"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleXIcon, EyeIcon, EyeOffIcon } from "lucide-react"
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { getErrorMessage } from "@/lib/api-error"
import { useResetPasswordMutation } from "@/features/auth/hooks"
import { resetPasswordSchema, ResetPasswordSchemaFormValues } from "@/features/auth/schema"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const resetPasswordMutation = useResetPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchemaFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  // Landed on straight from the emailed link (AuthController.ForgotPassword) — no userId/token
  // means someone opened this page directly rather than through a real link.
  if (!userId || !token) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleXIcon />
          </EmptyMedia>
          <EmptyTitle>Link invalid or expired</EmptyTitle>
          <EmptyDescription>
            This password reset link is missing required information. Request a new one to
            try again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/forgot-password">Request a new link</Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const onSubmit = (values: ResetPasswordSchemaFormValues) => {
    resetPasswordMutation.mutate(
      { userId, token, newPassword: values.newPassword },
      {
        onSuccess: () => {
          router.push("/auth/reset-password/success")
        },
        onError: (error) => {
          toast.error(
            getErrorMessage(error, "Couldn't reset your password. Please try again.")
          )
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  {...register("newPassword")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[errors.newPassword]} />
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
              </InputGroup>
              <FieldError errors={[errors.confirmPassword]} />
            </Field>

            <Button
              type="submit"
              className="mt-2"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending && <Spinner />}
              Reset password
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-xs text-muted-foreground">
          <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
            Back to log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
