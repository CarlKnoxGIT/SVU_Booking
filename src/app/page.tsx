import Link from 'next/link'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 text-white">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl text-center">
        <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">
          Swinburne University of Technology
        </p>
        <h1 className="mb-5 text-6xl font-bold tracking-tight leading-tight">
          Swinburne's<br />Virtual Universe
        </h1>
        <p className="mb-10 text-lg text-white/40 leading-relaxed">
          100m² curved LED wall · 360° immersive audio · Full 3D capability.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/events"
            className="rounded-full bg-indigo-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
          >
            Upcoming Events
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/10 bg-white/5 px-7 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200"
          >
            Staff Sign In
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-px sm:grid-cols-3 rounded-2xl overflow-hidden border border-white/8">
          {[
            {
              title: 'Academic Bookings',
              desc: 'Swinburne staff self-serve book sessions for teaching and research.',
            },
            {
              title: 'School Visits',
              desc: 'School groups request guided immersive sessions for students.',
            },
            {
              title: 'Public Events',
              desc: 'Members of the public purchase tickets to curated SVU experiences.',
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className={`bg-white/[0.03] p-7 ${i < 2 ? 'sm:border-r border-white/8' : ''}`}
            >
              <h3 className="mb-2 text-sm font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
