const EVENTBRITE_API = 'https://www.eventbriteapi.com/v3'
const REVALIDATE_SECONDS = 60

type TicketClass = {
  quantity_total: number | null
  quantity_sold: number | null
  on_sale_status?: string
  hidden?: boolean
}

export type TicketAvailability = {
  ticketsLeft: number
  capacity: number
  soldOut: boolean
}

export function extractEventIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/-(\d{10,})(?:[?/#]|$)/)
  return match ? match[1] : null
}

export async function getTicketAvailability(
  eventUrl: string | null | undefined
): Promise<TicketAvailability | null> {
  const token = process.env.EVENTBRITE_PRIVATE_TOKEN
  if (!token) return null

  const eventId = extractEventIdFromUrl(eventUrl)
  if (!eventId) return null

  try {
    const res = await fetch(`${EVENTBRITE_API}/events/${eventId}/ticket_classes/`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: REVALIDATE_SECONDS, tags: [`eventbrite:${eventId}`] },
    })

    if (!res.ok) return null

    const body = (await res.json()) as { ticket_classes?: TicketClass[] }
    const classes = (body.ticket_classes ?? []).filter((tc) => !tc.hidden)
    if (classes.length === 0) return null

    let capacity = 0
    let sold = 0
    for (const tc of classes) {
      capacity += tc.quantity_total ?? 0
      sold += tc.quantity_sold ?? 0
    }

    const ticketsLeft = Math.max(0, capacity - sold)
    return { ticketsLeft, capacity, soldOut: ticketsLeft === 0 }
  } catch {
    return null
  }
}
