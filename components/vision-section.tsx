export function VisionSection() {
  return (
    <section className="relative overflow-hidden bg-[#FF6B1A] py-24 lg:py-32">
      {/* Subtle pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#FAFAFA]/20" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#0D0D0D]/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#FAFAFA] md:text-5xl text-balance">
          Designed to grow with your gym
        </h2>
        <p className="mt-6 text-xl leading-relaxed text-[#FAFAFA]/90">
          From one branch to many. We{"'"}re building the future of gym
          operations for independent fitness businesses.
        </p>
      </div>
    </section>
  )
}
