import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SwinburneLogo from '@/components/swinburne-logo'
import { TicketCheckout } from './ticket-checkout'

export default async function TicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, description, event_date, start_time, end_time, ticket_price, max_capacity, tickets_sold, is_published')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!event) notFound()

  const ticketsLeft = event.max_capacity - (event.tickets_sold ?? 0)
  const soldOut = ticketsLeft <= 0
  const isFree = !event.ticket_price || event.ticket_price === 0

  const date = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">
        <Link href="/">
          <SwinburneLogo className="h-8 w-auto" />
        </Link>
        <Link
          href="/events"
          className="text-[12px] text-white/40 hover:text-white/70 transition-colors"
        >
          ← All events
        </Link>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Event info */}
          <div className="lg:col-span-3">
            <div className="relative aspect-[16/9] overflow-hidden mb-8">
              <Image
                src="/images/SVU19BC.jpg"
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <p className="text-[11px] font-bold tracking-[0.18em] text-swin-red-light uppercase mb-3">
              {date}
              {event.start_time && <> · {event.start_time.slice(0, 5)}{event.end_time && `–${event.end_time.slice(0, 5)}`}</>}
            </p>
            <h1 className="text-3xl sm:text-4xl font-light leading-tight mb-4">{event.title}</h1>
            {event.description && (
              <p className="text-[14px] text-white/45 leading-relaxed">{event.description}</p>
            )}

            <div className="mt-8 space-y-3 border-t border-white/[0.06] pt-8">
              {[
                { label: 'Venue', value: 'Swinburne, Hawthorn Campus — ATC Building, Room 103' },
                { label: 'Duration', value: event.start_time && event.end_time ? `${event.start_time.slice(0,5)} – ${event.end_time.slice(0,5)}` : 'See event details' },
                { label: 'Capacity', value: `${ticketsLeft} of ${event.max_capacity} tickets remaining` },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 text-[13px]">
                  <span className="w-20 flex-shrink-0 text-white/30">{label}</span>
                  <span className="text-white/70">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout panel */}
          <div className="lg:col-span-2">
            <div className="border border-white/[0.08] bg-white/[0.02] p-7 sticky top-8">
              <p className="text-[11px] font-bold tracking-[0.16em] text-white/25 uppercase mb-5">
                {soldOut ? 'Sold out' : 'Get tickets'}
              </p>

              {soldOut ? (
                <div className="text-center py-8">
                  <p className="text-white/40 text-[14px]">This event is sold out.</p>
                  <Link
                    href="/events"
                    className="mt-6 inline-flex rounded-full border border-white/15 px-5 py-2 text-[13px] text-white/50 hover:text-white hover:border-white/30 transition-all"
                  >
                    Browse other events
                  </Link>
                </div>
              ) : (
                <TicketCheckout
                  eventId={event.id}
                  ticketPrice={Number(event.ticket_price)}
                  isFree={isFree}
                  ticketsLeft={ticketsLeft}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
