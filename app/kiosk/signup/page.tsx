import { redirect } from "next/navigation"

// Kiosk signup removed — members sign up via gym-specific signup flow.
export default function KioskSignupPage() {
  redirect("/gym-select")
}