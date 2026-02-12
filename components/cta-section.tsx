import { Monitor, MessageSquare, Rocket } from "lucide-react"
import Link from "next/link"

const options = [
  {
    icon: Monitor,
    title: "Open Kiosk",
    description: "Check in, sign up, and renew",
    href: "/kiosk",
  },
  {
    icon: Rocket,
    title: "Admin Dashboard",
    description: "Analytics, members, payments",
    href: "/admin",
  },
  {
    icon: MessageSquare,
    title: "New Member Signup",
    description: "Register and pay instantly",
    href: "/kiosk/signup",
  },
]

export function CtaSection() {
  return (
    <section id="contact" className="bg-[#0D0D0D] py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="font-display text-4xl font-extrabold tracking-tight text-[#FAFAFA] md:text-6xl text-balance">
          Ready to modernize your gym?
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[#FAFAFA]/60">
          Join the pilot program and help shape the future of gym management.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {options.map((option) => (
            <Link
              key={option.title}
              href={option.href}
              className="group flex flex-col items-center rounded-2xl border-2 border-[#ffffff10] bg-[#ffffff05] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6B1A] hover:bg-[#FF6B1A]"
            >
              <option.icon className="mb-4 h-7 w-7 text-[#FF6B1A] transition-colors group-hover:text-[#FAFAFA]" />
              <h4 className="font-display text-lg font-bold text-[#FAFAFA]">
                {option.title}
              </h4>
              <p className="mt-1 text-sm text-[#FAFAFA]/50 transition-colors group-hover:text-[#FAFAFA]/80">
                {option.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
