import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import SwinburneLogo from '@/components/swinburne-logo'
import { ParallaxHero } from '@/components/parallax-hero'
import { getTicketAvailability } from '@/lib/eventbrite/client'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, description, event_date, start_time, end_time, ticket_price, max_capacity, tickets_sold, humanitix_url')
    .eq('is_published', true)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true })

  const availability = await Promise.all(
    (events ?? []).map((e) => getTicketAvailability(e.humanitix_url))
  )

  const { data: hiddenEvent } = await supabase
    .from('events')
    .select('humanitix_url, max_capacity, tickets_sold')
    .eq('is_published', false)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('start_time', { ascending: true })
    .limit(1)
    .maybeSingle()

  const hiddenAvail = hiddenEvent ? await getTicketAvailability(hiddenEvent.humanitix_url) : null
  const hiddenLeft = hiddenAvail?.ticketsLeft ?? (
    hiddenEvent ? Math.max(0, (hiddenEvent.max_capacity ?? 0) - (hiddenEvent.tickets_sold ?? 0)) : null
  )

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
      <div className="relative h-72 overflow-hidden">
        <ParallaxHero>
          <Image
            src="/images/SVU11C.jpg"
            alt="SVU events"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </ParallaxHero>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-center">
          <Link href="/" className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white/70 transition-colors mb-3">
            Swinburne's Virtual Universe
          </Link>
          <h1 className="text-4xl font-light tracking-tight">Upcoming Events</h1>
          <p className="mt-2 text-sm text-white/60">Immersive experiences on a 100m² curved LED wall.</p>
        </div>
      </div>

      {hiddenAvail !== null && hiddenLeft !== null && (
        <p className="fixed bottom-6 right-6 z-50 text-[11px] tabular-nums text-white/[0.18] select-none pointer-events-none">
          {hiddenLeft} / {hiddenAvail.capacity}
        </p>
      )}

      <div className="mx-auto max-w-3xl px-6 pb-20">

        {/* Events */}
        {events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, i) => {
              const live = availability[i]
              const ticketsLeft = live ? live.ticketsLeft : (event.max_capacity ?? 0) - (event.tickets_sold ?? 0)
              const soldOut = live ? live.soldOut : ticketsLeft <= 0
              const date = event.event_date ? new Date(event.event_date) : null

              return (
                <div
                  key={event.id}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {date && (
                        <p className="mb-2 text-[12px] font-semibold tracking-wide text-swin-red-light uppercase">
                          {date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long' })}
                          {event.start_time && <> · {event.start_time.slice(0, 5)}{event.end_time && <> – {event.end_time.slice(0, 5)}</>}</>}
                        </p>
                      )}
                      <h2 className="text-[20px] font-semibold text-white">{event.title}</h2>
                      {event.description && (
                        <p className="mt-2 text-[15px] text-white/70 leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-4 text-[13px]">
                        <span className="font-semibold text-white">
                          {event.ticket_price === 0 || event.ticket_price === null
                            ? 'Free'
                            : `$${event.ticket_price}`}
                        </span>
                        {live && !soldOut && (
                          <span className={ticketsLeft <= 10 ? 'text-swin-red-light font-medium' : 'text-white/60'}>
                            {ticketsLeft} of {live.capacity} tickets left
                          </span>
                        )}
                      </div>
                    </div>

                    {soldOut ? (
                      <span className="flex-shrink-0 rounded-xl bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/50 cursor-default">
                        Sold out
                      </span>
                    ) : event.humanitix_url ? (
                      <a
                        href={event.humanitix_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 rounded-xl bg-swin-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-swin-red-hover transition-all duration-200"
                      >
                        Get tickets
                      </a>
                    ) : (
                      <span className="flex-shrink-0 rounded-xl bg-white/20 px-4 py-2 text-[13px] font-semibold text-white/60 cursor-default">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-24 text-center">
            <p className="text-white/50 text-sm">No upcoming events scheduled.</p>
            <p className="mt-2 text-white/35 text-xs">Check back soon.</p>
          </div>
        )}
      </div>
    </main>
  )
}
