import Link from 'next/link'
import Image from 'next/image'
import SwinburneLogo from '@/components/swinburne-logo'
import { ParallaxHero } from '@/components/parallax-hero'

export const metadata = {
  title: 'School Visits — Swinburne Virtual Universe',
  description: 'Bring your class inside a 100m² curved LED wall. Curriculum-aligned immersive experiences for primary and secondary students.',
}

export default function SchoolGroupsPage() {
  return (
    <main className="bg-black text-white">

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <Link href="/">
          <SwinburneLogo className="h-8 w-auto" />
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-[12px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          Staff sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[520px] flex flex-col items-start justify-end overflow-hidden">
        <ParallaxHero>
          <Image
            src="/images/SVU01D.jpg"
            alt="Students in 3D glasses inside the Virtual Universe"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </ParallaxHero>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/90" />
        <div className="relative z-10 px-8 sm:px-16 pb-16 max-w-2xl">
          <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-4">
            Educational visits
          </p>
          <h1 className="text-4xl sm:text-6xl font-light leading-[1.06] tracking-[-1px] mb-5">
            Bring the cosmos<br />into the classroom
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-md">
            Curriculum-aligned immersive sessions inside a 100m² curved LED wall.
            Built for primary through to VCE.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-5xl px-8 py-20">

        {/* Key details strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-b border-white/[0.07] pb-16 mb-16">
          {[
            { value: '100m²', label: 'Curved LED wall' },
            { value: '360°', label: 'Immersive audio' },
            { value: '45–60 min', label: 'Session length' },
            { value: 'Yrs 3–12', label: 'All year levels' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-light text-white mb-1">{value}</p>
              <p className="text-[12px] text-white/35 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Programs */}
        <div className="mb-20">
          <p className="text-[11px] font-bold tracking-[0.18em] text-white/25 uppercase mb-10">
            Programs
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                level: 'Primary',
                years: 'Years 3–6',
                title: 'Our Solar System',
                desc: 'Explore the planets, moons and the Sun through real NASA data and imagery. Aligned to Earth and Space sciences.',
              },
              {
                level: 'Lower Secondary',
                years: 'Years 7–9',
                title: 'Scale of the Universe',
                desc: 'Journey from Earth to the cosmic web. Covers distance, light-years, and the structure of galaxies.',
              },
              {
                level: 'VCE',
                years: 'Years 10–12',
                title: 'Stars & Stellar Evolution',
                desc: 'H-R diagrams, stellar lifecycles, and supernovae rendered in real astrophysical data. Aligned to Unit 3/4 Physics.',
              },
            ].map((program) => (
              <div
                key={program.title}
                className="border border-white/[0.07] bg-white/[0.02] p-7 hover:border-white/[0.14] transition-all duration-200"
              >
                <p className="text-[10px] font-bold tracking-[0.16em] text-swin-red-light uppercase mb-1">
                  {program.level} · {program.years}
                </p>
                <h3 className="text-lg font-light text-white mb-3">{program.title}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{program.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-20">
          <p className="text-[11px] font-bold tracking-[0.18em] text-white/25 uppercase mb-10">
            How it works
          </p>
          <div className="space-y-8">
            {[
              { step: '01', title: 'Submit an enquiry', desc: 'Tell us your year level, preferred dates, and group size. We\'ll confirm availability within 2 business days.' },
              { step: '02', title: 'Receive a quote', desc: 'Pricing is per student. We\'ll send a formal quote and booking confirmation once dates are locked in.' },
              { step: '03', title: 'Visit the SVU', desc: 'Arrive at Swinburne\'s Hawthorn Campus. Your facilitator will run the full session — no preparation required.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-8 items-start border-t border-white/[0.06] pt-8">
                <p className="text-[11px] font-bold text-white/20 w-8 flex-shrink-0 mt-0.5">{step}</p>
                <div>
                  <h4 className="text-[15px] font-semibold text-white mb-1">{title}</h4>
                  <p className="text-[13px] text-white/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border border-white/[0.07] bg-white/[0.02] p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-light text-white mb-2">Ready to book?</h2>
            <p className="text-[13px] text-white/40">Group sizes from 20 to 60 students. Weekdays during school terms.</p>
          </div>
          <Link
            href="/enquire?type=school"
            className="flex-shrink-0 rounded-full bg-white text-black px-8 py-3 text-[14px] font-semibold hover:bg-white/90 transition-all duration-200"
          >
            Enquire now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SwinburneLogo className="h-7 w-auto opacity-60" />
            <p className="text-[12px] text-white/20">Hawthorn Campus, Melbourne</p>
          </div>
          <div className="flex gap-6 text-[12px] text-white/25">
            <Link href="/events" className="hover:text-white/60 transition-colors">Events</Link>
            <Link href="/school-groups" className="hover:text-white/60 transition-colors">Schools</Link>
            <Link href="/enquire" className="hover:text-white/60 transition-colors">Hire</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Staff</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
