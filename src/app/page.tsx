import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
      <div className="max-w-2xl text-center">
        <p className="mb-4 text-sm font-semibold tracking-widest text-indigo-400 uppercase">
          Swinburne University of Technology
        </p>
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Swinburne&apos;s Virtual Universe
        </h1>
        <p className="mb-10 text-lg text-zinc-400 leading-relaxed">
          100m² curved LED wall &middot; 360° stereo audio &middot; 3D capable.
          <br />
          Book a session, purchase tickets, or manage the facility.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/events"
            className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Upcoming Events
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/20 px-8 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Staff Login
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          {[
            {
              title: 'Academic Bookings',
              desc: 'Swinburne staff can self-serve book sessions for teaching and research.',
            },
            {
              title: 'School Visits',
              desc: 'School groups can request guided immersive sessions for students.',
            },
            {
              title: 'Public Events',
              desc: 'Members of the public can purchase tickets to curated SVU experiences.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="mb-2 font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-zinc-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
