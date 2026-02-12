import Image from "next/image"
import { Users, CreditCard, QrCode, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Member Management",
    description:
      "Complete profiles, membership status, and payment history — all in one place.",
  },
  {
    icon: CreditCard,
    title: "Payment Tracking",
    description:
      "Know exactly who paid, when they paid, and who's overdue. Auto-reminders included.",
  },
  {
    icon: QrCode,
    title: "QR Code Check-In",
    description:
      "Members scan to check in. You know who's inside. Simple as that.",
  },
  {
    icon: BarChart3,
    title: "Simple Reports",
    description:
      "See revenue, attendance trends, and membership growth at a glance.",
  },
]

export function SolutionSection() {
  return (
    <section id="features" className="relative overflow-hidden bg-[#0D0D0D] py-24 lg:py-32">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#FF6B1A]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left: Image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="/images/training-floor.jpg"
              alt="Athletes training on the gym floor"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/40 to-transparent" />
          </div>

          {/* Right: Content */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B1A]">
              The Solution
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[#FAFAFA] md:text-5xl text-balance">
              Everything you need. Nothing you don{"'"}t.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[#FAFAFA]/60">
              Operate like a real business, not a notebook.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="group">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B1A] transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-[#FAFAFA]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#FAFAFA]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#FAFAFA]/50">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
