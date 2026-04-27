import Link from 'next/link'
import Image from 'next/image'
import SwinburneLogo from '@/components/swinburne-logo'
import { EnquiryForm } from './enquiry-form'
import { ParallaxHero } from '@/components/parallax-hero'

export const metadata = {
  title: 'Enquire — Swinburne Virtual Universe',
  description: 'Enquire about hiring the SVU for corporate events, product launches, or private experiences.',
}

export default function EnquirePage() {
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
      <section className="relative h-[55vh] min-h-[420px] flex flex-col items-start justify-end overflow-hidden">
        <ParallaxHero>
          <Image
            src="/images/SVU11C.jpg"
            alt="Host presenting to an audience inside the SVU"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </ParallaxHero>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/95" />
        <div className="relative z-10 px-8 sm:px-16 pb-14 max-w-2xl">
          <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-4">
            Private hire
          </p>
          <h1 className="text-4xl sm:text-5xl font-light leading-[1.08] tracking-[-1px]">
            Your event.<br />An unforgettable stage.
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-8 py-20">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">

          {/* Left — what's included */}
          <div className="lg:col-span-2">
            <p className="text-[11px] font-bold tracking-[0.18em] text-white/25 uppercase mb-8">
              What's included
            </p>
            <div className="space-y-6">
              {[
                { title: '100m² LED wall', desc: 'Full curved surface available for custom content, branding, or SVU experiences.' },
                { title: '360° spatial audio', desc: 'Surround sound system with 12 channels of pristine spatial audio.' },
                { title: 'Technical operator', desc: 'Dedicated AV technician for setup, run of show, and pack down.' },
                { title: 'Up to 60 guests', desc: 'Seated or standing configurations across the full floor area.' },
                { title: 'Custom content', desc: 'Bring your own visuals or work with our team to create something bespoke.' },
              ].map(({ title, desc }) => (
                <div key={title} className="border-t border-white/[0.06] pt-6">
                  <h4 className="text-[14px] font-semibold text-white mb-1">{title}</h4>
                  <p className="text-[13px] text-white/40 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 border border-white/[0.07] bg-white/[0.02] p-6">
              <p className="text-[11px] font-bold tracking-[0.16em] text-white/25 uppercase mb-3">Location</p>
              <p className="text-[14px] text-white/70 leading-relaxed">
                Swinburne, Hawthorn Campus<br />
                ATC Building, Room 103<br />
                <span className="text-white/35 text-[12px]">Free parking available on evenings and weekends</span>
              </p>
            </div>

            <div className="mt-6 border border-white/[0.07] bg-white/[0.02] p-6">
              <p className="text-[11px] font-bold tracking-[0.16em] text-white/25 uppercase mb-3">Contact</p>
              <a
                href="mailto:svu@swin.edu.au"
                className="text-[14px] text-swin-red-light hover:text-white transition-colors duration-200"
              >
                svu@swin.edu.au
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <p className="text-[11px] font-bold tracking-[0.18em] text-white/25 uppercase mb-8">
              Send an enquiry
            </p>
            <EnquiryForm />
          </div>

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
