import { redirect } from "next/navigation"

// Kiosk signup removed — members sign up via /signup/member
export default function KioskSignupPage() {
  redirect("/signup/member")
}