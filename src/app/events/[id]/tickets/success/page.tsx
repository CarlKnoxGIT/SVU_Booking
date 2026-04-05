import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SwinburneLogo from '@/components/swinburne-logo'
import QRCode from 'qrcode'

export default async function TicketSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string; qr?: string }>
}) {
  const { id } = await params
  const { qr } = await searchParams

  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, event_date, start_time')
    .eq('id', id)
    .single()

  let qrDataUrl: string | null = null
  if (qr) {
    qrDataUrl = await QRCode.toDataURL(qr, { width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
  }

  const date = event?.event_date
    ? new Date(event.event_date).toLocaleDateString('en-AU', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <main className="bg-black text-white min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">
        <Link href="/">
          <SwinburneLogo className="h-8 w-auto" />
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md">
          {/* Checkmark */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center border border-swin-red/30 bg-swin-red/10">
            <svg className="h-8 w-8 text-swin-red-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-3xl font-light mb-3">You&apos;re in.</h1>
          <p className="text-white/40 text-[15px] leading-relaxed mb-2">
            Your tickets for{' '}
            <span className="text-white/70">{event?.title ?? 'this event'}</span>{' '}
            have been confirmed.
          </p>
          {date && event?.start_time && (
            <p className="text-white/30 text-[13px] mb-10">
              {date} · {event.start_time.slice(0, 5)}
            </p>
          )}

          {qrDataUrl && (
            <div className="border border-white/[0.07] bg-white/[0.02] p-6 mb-6 flex flex-col items-center gap-3">
              <p className="text-[11px] text-white/30 uppercase tracking-wide font-bold self-start">Your entry ticket</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Entry QR code" className="w-40 h-40" />
              <p className="text-[11px] text-white/25">Show this at the door</p>
            </div>
          )}

          <div className="border border-white/[0.07] bg-white/[0.02] p-6 mb-8 text-left space-y-3">
            <p className="text-[12px] text-white/30 uppercase tracking-wide font-bold mb-4">What happens next</p>
            {[
              'A confirmation email has been sent with your QR code.',
              'Arrive at Swinburne Hawthorn Campus, ATC Building Room 103, 10 minutes before the session.',
            ].map((step, i) => (
              <div key={i} className="flex gap-3 text-[13px] text-white/50">
                <span className="text-swin-red-light flex-shrink-0">·</span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/events"
              className="rounded-full border border-white/15 px-6 py-2.5 text-[13px] text-white/50 hover:text-white hover:border-white/30 transition-all"
            >
              Browse more events
            </Link>
            <Link
              href="/"
              className="rounded-full bg-white text-black px-6 py-2.5 text-[13px] font-semibold hover:bg-white/90 transition-all"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
