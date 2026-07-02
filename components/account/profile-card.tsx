"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useCurrentUserQuery, useUpdateProfileMutation } from "@/features/users/hooks"
import { setupSchema, SetupSchemaFormValues } from "@/features/users/schema"
import { ICurrentUser } from "@/features/users/types"
import { getErrorMessage } from "@/lib/api-error"
import { CURRENCIES } from "@/lib/currencies"

// Only mounts once `user` is available, so defaultValues are correct on first render —
// no need to reset()/sync on an effect like the create/edit dialogs elsewhere, since this
// form never has to swap between "which record" it's showing.
function ProfileForm({ user }: { user: ICurrentUser }) {
  const updateProfileMutation = useUpdateProfileMutation()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupSchemaFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      currency: user.currency ?? "",
    },
  })

  const onSubmit = (values: SetupSchemaFormValues) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Profile updated.")
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Couldn't update your profile."))
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <Field data-invalid={!!errors.currency}>
          <FieldLabel htmlFor="currency">Currency</FieldLabel>
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="currency"
                  aria-invalid={!!errors.currency}
                  className="w-full"
                >
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

        <Button type="submit" className="mt-2 self-start" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending && <Spinner />}
          Save changes
        </Button>
      </FieldGroup>
    </form>
  )
}

export function ProfileCard() {
  const currentUserQuery = useCurrentUserQuery()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your name and preferred currency.</CardDescription>
      </CardHeader>
      <CardContent>
        {currentUserQuery.isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : currentUserQuery.data ? (
          <ProfileForm user={currentUserQuery.data} />
        ) : (
          <p className="text-xs text-muted-foreground">Couldn&apos;t load your profile.</p>
        )}
      </CardContent>
    </Card>
  )
}
