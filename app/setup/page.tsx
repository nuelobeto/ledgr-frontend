"use client"

import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { CURRENCIES } from "@/lib/currencies"
import { getErrorMessage } from "@/lib/api-error"
import { useUpdateProfileMutation } from "@/features/users/hooks"
import { setupSchema, SetupSchemaFormValues } from "@/features/users/schema"

export default function SetupPage() {
  const router = useRouter()
  const updateProfileMutation = useUpdateProfileMutation()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupSchemaFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: { firstName: "", lastName: "", currency: "" },
  })

  const onSubmit = (values: SetupSchemaFormValues) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        // useAuthGuard re-checks the (now-updated) cached user on the next render and stops
        // redirecting here — this push just gets us off /setup immediately instead of waiting.
        router.push("/")
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Couldn't save your details. Please try again."))
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your account</CardTitle>
        <CardDescription>
          Tell us a bit about yourself before you get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="firstName">First name</FieldLabel>
              <Input
                id="firstName"
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                {...register("firstName")}
              />
              <FieldError errors={[errors.firstName]} />
            </Field>

            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="lastName">Last name</FieldLabel>
              <Input
                id="lastName"
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                {...register("lastName")}
              />
              <FieldError errors={[errors.lastName]} />
            </Field>

            <Field data-invalid={!!errors.currency}>
              <FieldLabel htmlFor="currency">Currency</FieldLabel>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="currency" aria-invalid={!!errors.currency} className="w-full">
                      <SelectValue placeholder="Choose a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} — {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.currency]} />
            </Field>

            <Button type="submit" className="mt-2" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending && <Spinner />}
              Continue
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
