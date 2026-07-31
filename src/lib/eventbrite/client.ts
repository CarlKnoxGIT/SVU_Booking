const EVENTBRITE_API = 'https://www.eventbriteapi.com/v3'
// Public "destination" endpoint that powers Eventbrite's own listing pages. It
// returns live sold-out status for events the authenticated API can't report on
// (notably recurring/series events, whose ticket quantities come back as null).
const EVENTBRITE_DESTINATION = 'https://www.eventbrite.com/api/v3/destination/events'
const REVALIDATE_SECONDS = 60

type TicketClass = {
  quantity_total: number | null
  quantity_sold: number | null
  on_sale_status?: string
  hidden?: boolean
  free?: boolean
  cost?: { major_value?: string } | null
}

type DestinationAvailability = {
  has_available_tickets?: boolean
  is_sold_out?: boolean
  minimum_ticket_price?: { major_value?: string }
}

export type TicketAvailability = {
  soldOut: boolean
  // Exact counts are only available for single (non-recurring) events. For
  // recurring events Eventbrite returns null quantities, so these stay undefined
  // and callers fall back to the DB capacity / hide the "N of M left" line.
  ticketsLeft?: number
  capacity?: number
  minPrice?: number
}

export function extractEventIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/-(\d{10,})(?:[?/#]|$)/)
  return match ? match[1] : null
}

// Exact counts via the authenticated API — works for single (non-recurring)
// events. Handles both ways capacity can be configured on Eventbrite:
//   1. Per ticket type — each class carries its own quantity_total.
//   2. At the event level — ticket types are uncapped and the cap lives on the
//      event's `capacity` field (e.g. "80 pax per session").
// Returns null only when no capacity is set anywhere, so the caller can fall
// back to live sold-out status.
async function getCountsFromApi(eventId: string): Promise<TicketAvailability | null> {
  const token = process.env.EVENTBRITE_PRIVATE_TOKEN
  if (!token) return null

  try {
    const res = await fetch(`${EVENTBRITE_API}/events/${eventId}/ticket_classes/`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: REVALIDATE_SECONDS, tags: [`eventbrite:${eventId}`] },
    })
    if (!res.ok) return null

    const body = (await res.json()) as { ticket_classes?: TicketClass[] }
    const classes = (body.ticket_classes ?? []).filter((tc) => !tc.hidden)

    // Tickets sold across every visible ticket type — available regardless of
    // how capacity is configured.
    const sold = classes.reduce((total, tc) => total + (tc.quantity_sold ?? 0), 0)

    // Lowest paid ticket price across the visible ticket types, so the site can
    // show "From $X". This used to come from the public destination endpoint,
    // but once we return counts here we no longer fall through to it — so derive
    // it from the ticket classes we already fetched.
    const prices = classes
      .filter((tc) => !tc.free && tc.cost?.major_value != null)
      .map((tc) => Number(tc.cost!.major_value))
      .filter((n) => Number.isFinite(n))
    const minPrice = prices.length > 0 ? Math.min(...prices) : undefined

    // Case 1: capacity is set per ticket type.
    const capped = classes.filter((tc) => tc.quantity_total != null)
    if (capped.length > 0) {
      const capacity = capped.reduce((total, tc) => total + (tc.quantity_total ?? 0), 0)
      const ticketsLeft = Math.max(0, capacity - sold)
      return { soldOut: ticketsLeft === 0, ticketsLeft, capacity, minPrice }
    }

    // Case 2: capacity is set at the event level. Fall back to the event's own
    // `capacity` field and subtract the tickets already sold.
    const capacity = await getEventCapacity(eventId, token)
    if (capacity != null) {
      const ticketsLeft = Math.max(0, capacity - sold)
      return { soldOut: ticketsLeft === 0, ticketsLeft, capacity, minPrice }
    }

    return null
  } catch {
    return null
  }
}

// Event-level capacity via the authenticated API. Used when ticket types carry
// no per-type cap. Returns null when the event has no capacity set.
async function getEventCapacity(eventId: string, token: string): Promise<number | null> {
  try {
    const res = await fetch(`${EVENTBRITE_API}/events/${eventId}/`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: REVALIDATE_SECONDS, tags: [`eventbrite:${eventId}`] },
    })
    if (!res.ok) return null

    const body = (await res.json()) as { capacity?: number | null }
    return body.capacity ?? null
  } catch {
    return null
  }
}

// Live sold-out status (no exact count) via the public destination endpoint.
// This is the only source that reports availability for recurring/series events.
async function getStatusFromDestination(eventId: string): Promise<TicketAvailability | null> {
  try {
    const res = await fetch(
      `${EVENTBRITE_DESTINATION}/?event_ids=${eventId}&expand=ticket_availability`,
      { next: { revalidate: REVALIDATE_SECONDS, tags: [`eventbrite:${eventId}`] } }
    )
    if (!res.ok) return null

    const body = (await res.json()) as { events?: { ticket_availability?: DestinationAvailability }[] }
    const ta = body.events?.[0]?.ticket_availability
    if (!ta) return null

    const soldOut = ta.is_sold_out === true || ta.has_available_tickets === false
    const minPrice = ta.minimum_ticket_price?.major_value
      ? Number(ta.minimum_ticket_price.major_value)
      : undefined
    return { soldOut, minPrice }
  } catch {
    return null
  }
}

export async function getTicketAvailability(
  eventUrl: string | null | undefined
): Promise<TicketAvailability | null> {
  const eventId = extractEventIdFromUrl(eventUrl)
  if (!eventId) return null

  // Prefer exact counts (single events); fall back to live status (recurring events).
  return (await getCountsFromApi(eventId)) ?? (await getStatusFromDestination(eventId))
}

// Number of showtimes for a recurring (series) event. Returns null for single
// events (the series endpoint 404s) so callers show the normal single time.
export async function getSessionCount(
  eventUrl: string | null | undefined
): Promise<number | null> {
  const token = process.env.EVENTBRITE_PRIVATE_TOKEN
  if (!token) return null

  const eventId = extractEventIdFromUrl(eventUrl)
  if (!eventId) return null

  try {
    const res = await fetch(`${EVENTBRITE_API}/series/${eventId}/events/`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: REVALIDATE_SECONDS, tags: [`eventbrite:${eventId}`] },
    })
    if (!res.ok) return null

    const body = (await res.json()) as { events?: unknown[] }
    const count = body.events?.length ?? 0
    return count > 0 ? count : null
  } catch {
    return null
  }
}
