import Image from "next/image"
import { MapPin, Smartphone, Wifi, Coins } from "lucide-react"

const differentiators = [
  {
    icon: MapPin,
    title: "Local Context",
    description:
      "Understands how independent gyms actually operate. From payment methods to member behavior.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    description:
      "Manage everything from your phone. No need to sit at a computer.",
  },
  {
    icon: Wifi,
    title: "No Hardware Required",
    description:
      "No fingerprint scanners. No special equipment. Just your smartphone.",
  },
  {
    icon: Coins,
    title: "Affordable & Scalable",
    description:
      "Start small, grow big. Pricing that makes sense for 1 branch or 10.",
  },
]

export function WhyUsSection() {
  return (
    <section id="why-us" className="relative overflow-hidden bg-[#0D0D0D] py-24 lg:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left: Content */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B1A]">
              Why Choose Us
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[#FAFAFA] md:text-5xl text-balance">
              Built specifically for independent gyms
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {differentiators.map((item) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-[#ffffff10] bg-[#ffffff05] p-6 transition-all duration-300 hover:border-[#FF6B1A]/40 hover:bg-[#ffffff08]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6B1A]/15">
                    <item.icon className="h-5 w-5 text-[#FF6B1A]" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#FAFAFA]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#FAFAFA]/50">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="/assets/community.avif"
              alt="Group fitness class with energetic atmosphere"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
