import Image from 'next/image';

export function CommunityStatement() {
  return (
    <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/community-moment.jpg"
          alt="Gym community"
          fill
          className="object-cover photo-warm"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(44,44,44,0.25) 0%, rgba(44,44,44,0.45) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 text-center text-white px-6 max-w-2xl">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Made for Gyms Like Yours.
        </h2>
        <p className="text-lg text-gray-200 max-w-lg mx-auto">
          You don&apos;t need enterprise software. You need a tool that actually
          fits how you work.
        </p>
      </div>
    </section>
  );
}
