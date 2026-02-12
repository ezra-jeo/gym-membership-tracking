import { Shield, Users, Smartphone } from "lucide-react"

export function TrustBar() {
  return (
    <section className="border-b border-[#1A1A1A]/10 bg-[#FAFAFA]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 py-6 sm:flex-row sm:gap-12 lg:px-8">
        <div className="flex items-center gap-2.5 text-sm font-medium text-[#6B6B6B]">
          <Shield className="h-4 w-4 text-[#FF6B1A]" />
          <span>Built for Growing Gyms</span>
        </div>
        <div className="hidden h-4 w-px bg-[#E5E5E5] sm:block" />
        <div className="flex items-center gap-2.5 text-sm font-medium text-[#6B6B6B]">
          <Users className="h-4 w-4 text-[#FF6B1A]" />
          <span>Designed with Real Gym Owners</span>
        </div>
        <div className="hidden h-4 w-px bg-[#E5E5E5] sm:block" />
        <div className="flex items-center gap-2.5 text-sm font-medium text-[#6B6B6B]">
          <Smartphone className="h-4 w-4 text-[#FF6B1A]" />
          <span>Mobile-First Experience</span>
        </div>
      </div>
    </section>
  )
}
