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
            alt="Visitors standing before the SVU LED wall"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </ParallaxHero>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-[72px] font-light tracking-[-1.5px] leading-[1.04] mb-5">
            Step inside<br />the universe
          </h1>
          <p className="text-base sm:text-lg text-white/60 mb-10 leading-relaxed max-w-xl mx-auto">
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

      {/* ── Overview — dark beat, no photo ───────────────────── */}
      <section className="bg-[#080808] py-24 px-10 sm:px-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.18em] text-white/25 uppercase mb-8">
            Swinburne's Virtual Universe
          </p>
          <p className="text-2xl sm:text-[32px] font-light leading-relaxed text-white/75 max-w-3xl">
            Immersive storytelling powered by real scientific data — a 100m² stereoscopic LED wall, high-performance GPU rendering, and 360° audio, letting audiences explore the cosmos with unparalleled fidelity.
          </p>
        </div>
      </section>

      {/* ── Public Events — SVU07B, photo left ───────────────── */}
      <section className="relative min-h-[520px] flex flex-col lg:flex-row overflow-hidden">
        <Image
          src="/images/SVU07BCropped5.jpg"
          alt="Presenter with Saturn rings on the SVU LED wall"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/55 to-black/10" />

        <div className="hidden lg:block lg:w-1/2" />

        <div className="relative z-10 lg:w-1/2 flex items-center px-10 sm:px-16 py-24">
          <div className="max-w-sm">
            <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-5">Public Events</p>
            <h2 className="text-3xl font-light leading-snug text-white/90 mb-5">
              Immersive<br />experiences
            </h2>
            <p className="text-[15px] text-white/55 leading-relaxed mb-8">
              Curated shows blending real scientific data with cinematic visuals — from the birth of stars to the collision of black holes. Open to everyone.
            </p>
            <Link href="/events" className="inline-flex rounded-full bg-white text-black px-6 py-2.5 text-[13px] font-semibold hover:bg-white/90 transition-all">
              Browse events →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Schools — SVU01D, photo right ────────────────────── */}
      <section className="relative min-h-[500px] flex flex-col lg:flex-row overflow-hidden">
        <Image
          src="/images/SVU01D.jpg"
          alt="School group audience in 3D glasses at the SVU"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />

        <div className="relative z-10 lg:w-1/2 flex items-center px-10 sm:px-16 py-24">
          <div className="max-w-sm">
            <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-5">Schools</p>
            <h2 className="text-3xl font-light leading-snug text-white/90 mb-5">
              Educational<br />visits
            </h2>
            <p className="text-[15px] text-white/55 leading-relaxed mb-8">
              Guided immersive sessions tailored for curriculum and age group — making advanced astrophysics visceral and unforgettable for students.
            </p>
            <Link href="/school-groups" className="inline-flex rounded-full border border-white/25 px-6 py-2.5 text-[13px] font-semibold text-white/80 hover:bg-white/10 transition-all">
              Book a visit →
            </Link>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2" />
      </section>

      {/* ── Corporate / Hire — SVU20B, photo left ────────────── */}
      <section className="relative min-h-[500px] flex flex-col lg:flex-row overflow-hidden">
        <Image
          src="/images/SVU20B.jpg"
          alt="Visitors exploring the SVU visualisation"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/55 to-black/10" />

        <div className="hidden lg:block lg:w-1/2" />

        <div className="relative z-10 lg:w-1/2 flex items-center px-10 sm:px-16 py-24">
          <div className="max-w-sm">
            <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-5">Private Hire</p>
            <h2 className="text-3xl font-light leading-snug text-white/90 mb-5">
              Your event.<br />An unforgettable stage.
            </h2>
            <p className="text-[15px] text-white/55 leading-relaxed mb-8">
              Corporate events, product launches, and VIP experiences — for scientists, artists, and industry partners redefining how ideas are communicated.
            </p>
            <Link href="/enquire" className="inline-flex rounded-full border border-white/25 px-6 py-2.5 text-[13px] font-semibold text-white/80 hover:bg-white/10 transition-all">
              Enquire →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Future / CTA — SVU11C ────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[420px] flex items-center">
        <Image
          src="/images/SVU11C.jpg"
          alt="Host presenting to audience inside the SVU"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />

        <div className="relative z-10 px-12 sm:px-20 max-w-lg py-24">
          <p className="text-[11px] font-bold tracking-[0.18em] text-white/30 uppercase mb-5">Future</p>
          <h2 className="text-3xl sm:text-4xl font-light leading-tight text-white/90 mb-5">
            The universe<br />is just getting started.
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed mb-8">
            Expanding into generative storytelling, immersive gaming, and AI-driven science communication.
          </p>
          <a
            href="mailto:cknox@swin.edu.au"
            className="inline-flex rounded-full border border-white/20 px-6 py-2.5 text-[13px] font-medium text-white/60 hover:text-white hover:border-white/40 transition-all duration-200"
          >
            Get in touch →
          </a>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
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
