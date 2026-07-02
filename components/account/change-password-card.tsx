"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { useChangePasswordMutation } from "@/features/auth/hooks"
import { changePasswordSchema, ChangePasswordSchemaFormValues } from "@/features/auth/schema"
import { getErrorMessage } from "@/lib/api-error"

export function ChangePasswordCard() {
  const [showPasswords, setShowPasswords] = useState(false)
  const changePasswordMutation = useChangePasswordMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordSchemaFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const onSubmit = (values: ChangePasswordSchemaFormValues) => {
    changePasswordMutation.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed.")
          reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Couldn't change your password."))
        },
      }
    )
  }

  const inputType = showPasswords ? "text" : "password"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Your current session stays signed in — this only affects future logins.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="currentPassword"
                  type={inputType}
                  autoComplete="current-password"
                  aria-invalid={!!errors.currentPassword}
                  {...register("currentPassword")}
                />
              </InputGroup>
              <FieldError errors={[errors.currentPassword]} />
            </Field>

            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="newPassword"
                  type={inputType}
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  {...register("newPassword")}
                />
              </InputGroup>
              <FieldError errors={[errors.newPassword]} />
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="confirmPassword"
                  type={inputType}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                    onClick={() => setShowPasswords((v) => !v)}
                  >
                    {showPasswords ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[errors.confirmPassword]} />
            </Field>

            <Button
              type="submit"
              className="mt-2 self-start"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending && <Spinner />}
              Change password
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
