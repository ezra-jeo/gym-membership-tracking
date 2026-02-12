import { BookOpen, PenLine, MessageCircle, XCircle } from "lucide-react"

const problems = [
  {
    icon: BookOpen,
    title: "No idea who has paid",
    description:
      "No clear record of who has paid for the month. Just screenshots scattered across chat threads.",
  },
  {
    icon: PenLine,
    title: "Manual attendance tracking",
    description:
      "Everything is in a notebook. When someone asks how many times they came in, good luck finding it.",
  },
  {
    icon: MessageCircle,
    title: "Payment receipts buried in chats",
    description:
      "Receipts are lost in your chat history. When there is a dispute, you have to scroll endlessly to find proof.",
  },
  {
    icon: XCircle,
    title: "No records when problems arise",
    description:
      "When members complain about billing or access, you have no proof to show them. Everything is verbal.",
  },
]

export function ProblemSection() {
  return (
    <section className="bg-[#FAFAFA] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B1A]">
            The Reality
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[#1A1A1A] md:text-5xl text-balance">
            Running a gym shouldn{"'"}t feel this chaotic
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#6B6B6B]">
            You{"'"}re managing members, not a business. It{"'"}s time to change that.
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="group relative overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6B1A]/30 hover:shadow-lg"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#FF6B1A] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B1A]/10">
                <problem.icon className="h-6 w-6 text-[#FF6B1A]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#1A1A1A]">
                {problem.title}
              </h3>
              <p className="mt-3 leading-relaxed text-[#6B6B6B]">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
