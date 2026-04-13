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
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <Link href="/">
          <SwinburneLogo className="h-8 w-auto" />
        </Link>
        <Link
          href="/events"
          className="text-sm text-white/60 hover:text-white transition-colors"
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

            <p className="text-sm font-bold tracking-widest text-swin-red-light uppercase mb-3">
              {date}
              {event.start_time && <> · {event.start_time.slice(0, 5)}{event.end_time && `–${event.end_time.slice(0, 5)}`}</>}
            </p>
            <h1 className="text-4xl sm:text-5xl font-light leading-tight mb-5">{event.title}</h1>
            {event.description && (
              <p className="text-lg text-white/80 leading-relaxed">{event.description}</p>
            )}

            <div className="mt-8 space-y-5 border-t border-white/10 pt-8">
              {[
                { label: 'Venue', value: 'Swinburne, Hawthorn Campus — ATC Building, Room 103' },
                { label: 'Time', value: event.start_time && event.end_time ? `${event.start_time.slice(0,5)} – ${event.end_time.slice(0,5)}` : 'See event details' },
                { label: 'Tickets', value: `${ticketsLeft} of ${event.max_capacity} remaining` },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-6 text-base">
                  <span className="w-20 flex-shrink-0 text-white/50 font-medium">{label}</span>
                  <span className="text-white/90">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout panel */}
          <div className="lg:col-span-2">
            <div className="border border-white/15 bg-white/[0.04] p-8 sticky top-8">
              <p className="text-sm font-bold tracking-widest text-white/60 uppercase mb-6">
                {soldOut ? 'Sold out' : 'Coming soon'}
              </p>

              {soldOut ? (
                <div className="text-center py-8">
                  <p className="text-white/80 text-base">This event is sold out.</p>
                  <Link
                    href="/events"
                    className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-2 text-sm text-white/70 hover:text-white hover:border-white/40 transition-all"
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
