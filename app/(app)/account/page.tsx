import { ChangePasswordCard } from "@/components/account/change-password-card"
import { ProfileCard } from "@/components/account/profile-card"

export default function AccountPage() {
  return (
    <div className="flex max-w-lg flex-col gap-4">
      <ProfileCard />
      <ChangePasswordCard />
    </div>
  )
}
