import Link from 'next/link'
import Image from 'next/image'
import SwinburneLogo from '@/components/swinburne-logo'
import { ParallaxHero } from '@/components/parallax-hero'
import { SaturnAnimationLoader as SaturnAnimation } from '@/components/saturn-animation-loader'
import { CountUp } from '@/components/visitor-stats/count-up'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

async function getVisitorStats() {
  const supabase = await createClient()
  const [{ data: cats }, { data: entries }] = await Promise.all([
    supabase
      .from('visitor_categories')
      .select('id, slug, label, sort_order, is_active, is_activity')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('visitor_entries').select('category_id, count'),
  ])

  const totals = new Map<string, number>()
  for (const e of entries ?? []) {
    totals.set(e.category_id, (totals.get(e.category_id) ?? 0) + (e.count ?? 0))
  }

  const breakdown = (cats ?? []).map((c) => ({
    id: c.id,
    slug: c.slug as string,
    label: c.label,
    is_activity: !!c.is_activity,
    total: totals.get(c.id) ?? 0,
  }))

  const heroTotal = breakdown
    .filter((c) => !c.is_activity)
    .reduce((sum, c) => sum + c.total, 0)

  return { heroTotal, breakdown }
}

export default async function Home() {
  const { heroTotal, breakdown } = await getVisitorStats()
  const showSection = breakdown.length > 0
  return (
    <main className="bg-black text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.85)]">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <SwinburneLogo className="h-8 w-auto" />
        <Link
          href="/login"
          className="rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-[12px] font-medium text-white hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          Staff sign in
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative z-10 h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
        <ParallaxHero>
          <Image
            src="/images/SVU19BC.jpg"
            alt="Visitors standing before the SVU LED wall"
            fill
            priority
            className="object-cover object-[center_65%]"
            sizes="100vw"
          />
        </ParallaxHero>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80" />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-[72px] font-light tracking-[-1.5px] leading-[1.04] mb-5">
            Step inside<br />the universe
          </h1>
          <p className="text-base sm:text-lg text-white mb-10 leading-relaxed max-w-xl mx-auto">
            A 100m² curved LED wall. 360° immersive audio. Real scientific data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/events" className="rounded-full bg-white text-black px-8 py-3 text-[15px] font-semibold hover:bg-white/90 transition-all duration-200">
              Get tickets
            </Link>
            <Link href="/school-groups" className="rounded-full border border-white/20 bg-white/8 backdrop-blur-sm px-8 py-3 text-[15px] font-semibold hover:bg-white/15 transition-all duration-200">
              School visits
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40">
          <div className="w-px h-8 bg-white/40 animate-pulse" />
        </div>
      </section>

      {/* ── Saturn animation - scroll-scrubbed fly-through ────── */}
      <SaturnAnimation>
        <p className="text-[11px] font-bold tracking-[0.18em] text-white uppercase mb-5">
          Swinburne's Virtual Universe
        </p>
        <p className="text-2xl sm:text-[28px] font-light leading-relaxed text-white max-w-2xl">
          Immersive storytelling powered by real scientific data - a 100m² stereoscopic LED wall, high-performance GPU rendering, and 360° audio.
        </p>
      </SaturnAnimation>

      {/* ── By the numbers - visitor counts dashboard ─────────── */}
      {showSection && (
        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-3 text-center">
              By the numbers
            </p>
            <h2 className="text-3xl sm:text-4xl font-light leading-tight text-white text-center mb-3">
              Lives touched.<br />Universes shared.
            </h2>
            <p className="text-[13px] text-white/45 text-center mb-14">
              Since opening the SVU
            </p>

            {heroTotal > 0 && (
              <div className="text-center mb-16">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 mb-3">
                  Total Visitors
                </p>
                <p className="text-7xl sm:text-8xl font-light tracking-tight text-swin-red-light leading-none">
                  <CountUp value={heroTotal} />
                </p>
              </div>
            )}

            {breakdown.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {breakdown.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
                  >
                    <p className="text-xs font-medium tracking-wide text-white/55 uppercase">
                      {s.label}
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-tight text-swin-red-light">
                      <CountUp value={s.total} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Public Events - SVU07B, photo left ───────────────── */}
      <section className="relative min-h-[520px] flex overflow-hidden">
        <Image
          src="/images/SVU07BCropped5.jpg"
          alt="Presenter with Saturn rings on the SVU LED wall"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/55 to-black/10" />

        <div className="relative z-10 ml-auto w-full sm:w-1/2 flex items-center justify-end px-10 sm:px-16 py-24">
          <div className="max-w-sm">
            <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-5">Public Events</p>
            <h2 className="text-3xl font-light leading-snug text-white mb-5">
              Immersive<br />experiences
            </h2>
            <p className="text-[15px] text-white leading-relaxed mb-8">
              Curated shows blending real scientific data with cinematic visuals - from the birth of stars to the collision of black holes. Open to everyone.
            </p>
            <Link href="/events" className="inline-flex rounded-full bg-white text-black px-6 py-2.5 text-[13px] font-semibold hover:bg-white/90 transition-all">
              Browse events →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Schools - SVU01D ─────────────────────────────────── */}
      <section className="relative min-h-[500px] flex overflow-hidden">
        <Image
          src="/images/SVU01D.jpg"
          alt="School group audience in 3D glasses at the SVU"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/55 to-black/10" />

        <div className="relative z-10 ml-auto w-full sm:w-1/2 flex items-center justify-end px-10 sm:px-16 py-24">
          <div className="max-w-sm">
            <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-5">Schools</p>
            <h2 className="text-3xl font-light leading-snug text-white mb-5">
              Educational<br />visits
            </h2>
            <p className="text-[15px] text-white leading-relaxed mb-8">
              Guided immersive sessions tailored for curriculum and age group - making advanced astrophysics visceral and unforgettable for students.
            </p>
            <Link href="/school-groups" className="inline-flex rounded-full border border-white/25 px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10 transition-all">
              Book a visit →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Corporate / Hire - SVU20B ────────────────────────── */}
      <section className="relative min-h-[500px] flex overflow-hidden">
        <Image
          src="/images/SVU20B.jpg"
          alt="Visitors exploring the SVU visualisation"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />

        <div className="relative z-10 w-full sm:w-1/2 flex items-center px-10 sm:px-16 py-24">
          <div className="max-w-sm">
            <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-5">Private Hire</p>
            <h2 className="text-3xl font-light leading-snug text-white mb-5">
              Your event.<br />An unforgettable stage.
            </h2>
            <p className="text-[15px] text-white leading-relaxed mb-8">
              Corporate events, product launches, and VIP experiences - for scientists, artists, and industry partners redefining how ideas are communicated.
            </p>
            <Link href="/enquire" className="inline-flex rounded-full border border-white/25 px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10 transition-all">
              Enquire →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Future / CTA - SVU11C ────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[420px] flex items-center">
        <Image
          src="/images/SVU11C.jpg"
          alt="Host presenting to audience inside the SVU"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/60 to-black/20" />

        <div className="relative z-10 ml-auto w-full sm:w-1/2 flex justify-end px-12 sm:px-20 py-24">
          <div className="max-w-sm">
          <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-5">Future</p>
          <h2 className="text-3xl sm:text-4xl font-light leading-tight text-white mb-5">
            The universe<br />is just getting started.
          </h2>
          <p className="text-white text-[15px] leading-relaxed mb-8">
            Expanding into generative storytelling, immersive gaming, and AI-driven science communication.
          </p>
          <a
            href="mailto:svu@swin.edu.au"
            className="inline-flex rounded-full border border-white/20 px-6 py-2.5 text-[13px] font-medium text-white hover:text-white hover:border-white/40 transition-all duration-200"
          >
            Get in touch →
          </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 px-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SwinburneLogo className="h-7 w-auto opacity-60" />
            <p className="text-[12px] text-white">Hawthorn Campus, Melbourne</p>
          </div>
          <div className="flex gap-6 text-[12px] text-white">
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <Link href="/school-groups" className="hover:text-white transition-colors">Schools</Link>
            <Link href="/enquire" className="hover:text-white transition-colors">Hire</Link>
            <Link href="/login" className="hover:text-white transition-colors">Staff</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
