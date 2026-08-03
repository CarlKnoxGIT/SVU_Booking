import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { getTicketAvailability, getSessionCount } from '@/lib/eventbrite/client'
import { publicAsset } from '@/components/public-site/asset-path'
import { PublicShell } from '@/components/public-site/public-shell'
import { SplitLink } from '@/components/public-site/split-control'
import { NotifyMeCard } from './notify-me-card'

export const metadata = {
  title: 'Public Events | Swinburne Virtual Universe',
  description: 'Explore public experiences at the Swinburne Virtual Universe.',
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const countWord = (n: number) => NUMBER_WORDS[n] ?? String(n)

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

  const sessionCounts = await Promise.all(
    (events ?? []).map((e) => getSessionCount(e.humanitix_url))
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
    <PublicShell current="events" pageClassName="service-page public-events-page">
      <main id="main-content" className="scroll-container" tabIndex={-1}>
        <section className="service-hero page-section" data-reveal-section>
          <div className="service-hero__copy">
            <div>
              <h1 data-reveal-line>Public events</h1>
              <p className="service-hero__description" data-reveal-line>
                Explore presenter-led public and community experiences at Swinburne&apos;s Hawthorn campus.
              </p>
            </div>
            <div className="service-hero__intro" data-reveal-block>
              <SplitLink href="#whats-on" label="View public program" direction="down" />
            </div>
          </div>

          <figure className="service-hero__media" data-reveal-media>
            <Image
              src={publicAsset('/images/SVU07BCropped5.jpg')}
              alt="An audience surrounded by a vivid space visualisation inside the Swinburne Virtual Universe"
              fill
              priority
              sizes="100vw"
            />
            <figcaption>
              Public sessions bring an audience and expert presenter together for a shared journey through space.
            </figcaption>
          </figure>
        </section>

        <section className="page-section public-events-program" id="whats-on" data-reveal-section>
          <header className="section-heading event-listing__heading" data-reveal-block>
            <p className="eyebrow">What&apos;s on</p>
            <h2>Upcoming public events.</h2>
            <p>
              Discover presenter-led sessions, community programs, and immersive journeys through space.
            </p>
          </header>

          <div className="event-listing">
            <article className="event-listing__item event-listing__item--featured" data-reveal-block>
              <div className="event-listing__meta event-listing__date">
                <p>Fri 21 August · 16:00 – 19:00</p>
                <p>National Science Week</p>
              </div>
              <div className="event-listing__content">
                <h3 className="event-listing__title">Seeds of Science Festival</h3>
                <p className="event-listing__description">
                  Celebrate National Science Week with an afternoon of discovery — researcher talks, the
                  Festival Hub, and immersive Virtual Tours of the Universe with Professor Matthew Bailes.
                </p>
                <p className="event-listing__price">Free</p>
              </div>
              <div className="event-listing__action">
                <SplitLink
                  href="https://events.humanitix.com/seeds-of-science-festival"
                  label="Get tickets"
                  external
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </div>
            </article>

            {events && events.length > 0 ? (
              events.map((event, i) => {
                const live = availability[i]
                const hasCount = live?.ticketsLeft != null && live?.capacity != null
                const ticketsLeft = hasCount ? live!.ticketsLeft! : (event.max_capacity ?? 0) - (event.tickets_sold ?? 0)
                const soldOut = live ? live.soldOut : ticketsLeft <= 0
                const sessions = sessionCounts[i]
                const date = event.event_date ? new Date(event.event_date) : null

                return (
                  <article key={event.id} className="event-listing__item" data-reveal-block>
                    <div className="event-listing__meta event-listing__date">
                      {date && (
                        <p>
                          {date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long' })}
                          {sessions && sessions > 1
                            ? <> · {countWord(sessions)} shows available</>
                            : event.start_time && <> · {event.start_time.slice(0, 5)}{event.end_time && <> – {event.end_time.slice(0, 5)}</>}</>}
                        </p>
                      )}
                      <p>{soldOut ? 'Sold out' : event.humanitix_url ? 'Tickets available' : 'Coming soon'}</p>
                    </div>

                    <div className="event-listing__content">
                      <h3 className="event-listing__title">{event.title}</h3>
                      {event.description && <p className="event-listing__description">{event.description}</p>}
                      <div className="event-listing__details">
                        <p className="event-listing__price">
                          {event.ticket_price === 0 || event.ticket_price === null
                            ? 'Free'
                            : live?.minPrice
                              ? `Children's tickets only $${live.minPrice}`
                              : `$${event.ticket_price}`}
                        </p>
                        {hasCount && !soldOut && (
                          <p className="event-listing__availability">
                            {ticketsLeft} of {live!.capacity} tickets left
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="event-listing__action">
                      {soldOut ? (
                        <span className="event-listing__state">Sold out</span>
                      ) : event.humanitix_url ? (
                        <SplitLink
                          href={event.humanitix_url}
                          label="Get tickets"
                          external
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ) : (
                        <span className="event-listing__state">Coming soon</span>
                      )}
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="event-listing__empty" data-reveal-block>
                <p className="large-copy">Check back soon.</p>
                <p>New dates and registration details will appear here when sessions are released.</p>
              </div>
            )}
          </div>

          {hiddenAvail?.capacity != null && hiddenLeft !== null && (
            <p className="event-listing__hidden-count" aria-label={`${hiddenLeft} of ${hiddenAvail.capacity} tickets remaining`}>
              {hiddenLeft} / {hiddenAvail.capacity}
            </p>
          )}

          <NotifyMeCard />
        </section>
      </main>
    </PublicShell>
  )
}
