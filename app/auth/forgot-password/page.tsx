"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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
import { Spinner } from "@/components/ui/spinner"
import { getErrorMessage } from "@/lib/api-error"
import { useForgotPasswordMutation } from "@/features/auth/hooks"
import {
  forgotPasswordSchema,
  ForgotPasswordSchemaFormValues,
} from "@/features/auth/schema"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const forgotPasswordMutation = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = (values: ForgotPasswordSchemaFormValues) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => {
        // Same destination regardless of whether the email exists — ASP.NET's response is
        // deliberately generic here too (anti-enumeration), same as register.
        router.push("/auth/forgot-password/success")
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Something went wrong. Please try again."))
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to reset it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Button
              type="submit"
              className="mt-2"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending && <Spinner />}
              Send reset link
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
