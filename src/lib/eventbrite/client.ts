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

// Exact counts via the authenticated API — works for single events, whose ticket
// classes carry real quantity_total values. Returns null when no class has a cap
// set (recurring/series or genuinely uncapped events), so the caller can fall back.
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
    const capped = classes.filter((tc) => tc.quantity_total != null)
    if (capped.length === 0) return null

    let capacity = 0
    let sold = 0
    for (const tc of capped) {
      capacity += tc.quantity_total ?? 0
      sold += tc.quantity_sold ?? 0
    }

    const ticketsLeft = Math.max(0, capacity - sold)
    return { soldOut: ticketsLeft === 0, ticketsLeft, capacity }
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
