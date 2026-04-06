import Link from 'next/link'
import Image from 'next/image'
import SwinburneLogo from '@/components/swinburne-logo'
import { ParallaxHero } from '@/components/parallax-hero'

export default function Home() {
  return (
    <main className="bg-black text-white">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <SwinburneLogo className="h-8 w-auto" />
        <Link
          href="/login"
          className="rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-[12px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          Staff sign in
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
        <ParallaxHero>
          <Image
            src="/images/SVU19BC.jpg"
            alt="Visitors standing before the SVU LED wall displaying a nebula"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </ParallaxHero>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/85" />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-[72px] font-light tracking-[-1.5px] leading-[1.04] mb-5">
            Step inside<br />the universe
          </h1>
          <p className="text-base sm:text-lg text-white/80 mb-10 leading-relaxed max-w-xl mx-auto">
            100m² curved LED wall. 360° immersive audio. Real scientific data.
            <br className="hidden sm:block" />Experience space like never before.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/events"
              className="rounded-full bg-white text-black px-8 py-3 text-[15px] font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg shadow-black/30"
            >
              Get tickets
            </Link>
            <Link
              href="/school-groups"
              className="rounded-full border border-white/20 bg-white/8 backdrop-blur-sm px-8 py-3 text-[15px] font-semibold text-white hover:bg-white/15 transition-all duration-200"
            >
              School visits
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-8 bg-white/40 animate-pulse" />
        </div>
      </section>

      {/* ── Feature tiles ────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">

          {/* Section label */}
          <p className="text-[11px] font-bold tracking-[0.18em] text-white/25 uppercase mb-8">
            Experiences
          </p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Big tile */}
            <div className="lg:col-span-2 relative overflow-hidden aspect-[16/10] group cursor-pointer">
              <Image
                src="/images/SVU07BCropped5.jpg"
                alt="Presenter with Saturn rings on the LED wall"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <p className="text-[10px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-2">Public Events</p>
                <h3 className="text-2xl font-light leading-tight mb-2">Immersive<br />experiences</h3>
                <p className="text-sm text-white/50 max-w-xs leading-relaxed">
                  Curated shows blending real scientific data with cinematic visuals. Open to everyone.
                </p>
                <Link
                  href="/events"
                  className="mt-5 inline-flex rounded-full bg-white text-black px-5 py-2 text-[13px] font-semibold hover:bg-white/90 transition-all"
                >
                  Browse events →
                </Link>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden flex-1 min-h-[220px] group cursor-pointer">
                <Image
                  src="/images/SVU01D.jpg"
                  alt="Audience in 3D glasses"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">Schools</p>
                  <h3 className="text-lg font-light">Educational visits</h3>
                  <Link href="/school-groups" className="mt-3 inline-flex text-[12px] text-swin-red-light hover:text-swin-red-lighter font-medium transition-colors">
                    Book a visit →
                  </Link>
                </div>
              </div>

              <div className="relative overflow-hidden flex-1 min-h-[220px] group cursor-pointer">
                <Image
                  src="/images/SVU20B.jpg"
                  alt="Visitors exploring visualisation up close"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase mb-1">Corporate</p>
                  <h3 className="text-lg font-light">Private hire</h3>
                  <Link href="/enquire" className="mt-3 inline-flex text-[12px] text-swin-red-light hover:text-swin-red-lighter font-medium transition-colors">
                    Enquire →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full-width CTA band ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/SVU11C.jpg"
          alt="Host presenting to audience inside the SVU"
          width={2400}
          height={900}
          className="w-full object-cover max-h-[480px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center">
          <div className="px-12 sm:px-16 max-w-lg">
            <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-3">Hire the space</p>
            <h2 className="text-3xl sm:text-4xl font-light leading-tight mb-4">
              Your event.<br />An unforgettable stage.
            </h2>
            <p className="text-white/45 text-sm leading-relaxed mb-7">
              Corporate events, product launches, and private experiences on a 100m² curved LED wall with 360° audio.
            </p>
            <Link
              href="/enquire"
              className="inline-flex rounded-full bg-white text-black px-7 py-3 text-[14px] font-semibold hover:bg-white/90 transition-all"
            >
              Enquire about hire
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 px-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SwinburneLogo className="h-7 w-auto opacity-60" />
            <p className="text-[12px] text-white/20">
              Hawthorn Campus, Melbourne
            </p>
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
