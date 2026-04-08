'use server'

import { createAdminClient } from '@/lib/supabase/server'

export type Tally = { sold: number; checkedIn: number; eventTitle: string }

export type CheckInResult =
  | { status: 'success'; name: string | null; eventTitle: string; eventDate: string; startTime: string; endTime: string; quantity: number; checkedInAt: string; tally: Tally }
  | { status: 'already_used'; name: string | null; eventTitle: string; eventDate: string; startTime: string; endTime: string; quantity: number; checkedInAt: string; tally: Tally }
  | { status: 'not_found' }
  | { status: 'error'; message: string }

export async function checkInTicket(qrCode: string): Promise<CheckInResult> {
  const supabase = createAdminClient()

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('id, status, quantity, checked_in_at, user_id, event_id, buyer_name')
    .eq('qr_code', qrCode.trim())
    .single()

  if (error || !ticket) return { status: 'not_found' }

  // Fetch event and used-ticket quantities in parallel
  // Use buyer_name from ticket if set — it's the name entered at Stripe checkout,
  // which may differ from the user's registered account name.
  const [{ data: event }, { data: usedTickets }] = await Promise.all([
    supabase.from('events').select('title, event_date, start_time, end_time, tickets_sold').eq('id', ticket.event_id).single(),
    supabase.from('tickets').select('quantity').eq('event_id', ticket.event_id).eq('status', 'used'),
  ])

  const eventTitle = event?.title ?? 'Unknown event'
  const eventDate = event?.event_date ?? ''
  const startTime = event?.start_time ?? ''
  const endTime = event?.end_time ?? ''

  // Prefer the name recorded at purchase time; fall back to account name
  let name = ticket.buyer_name ?? null
  if (!name) {
    const { data: user } = await supabase.from('users').select('full_name').eq('id', ticket.user_id).single()
    name = user?.full_name ?? null
  }
  const checkedInTickets = usedTickets?.reduce((sum, t) => sum + t.quantity, 0) ?? 0
  const tally: Tally = { sold: event?.tickets_sold ?? 0, checkedIn: checkedInTickets, eventTitle }

  if (ticket.status === 'used') {
    return {
      status: 'already_used',
      name,
      eventTitle,
      eventDate,
      startTime,
      endTime,
      quantity: ticket.quantity,
      checkedInAt: ticket.checked_in_at!,
      tally,
    }
  }

  if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
    return { status: 'error', message: `Ticket is ${ticket.status}.` }
  }

  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ status: 'used', checked_in_at: now })
    .eq('id', ticket.id)

  if (updateError) return { status: 'error', message: 'Failed to check in ticket.' }

  // Re-sum ticket quantities after the check-in update
  const { data: updatedUsedTickets } = await supabase
    .from('tickets').select('quantity')
    .eq('event_id', ticket.event_id).eq('status', 'used')
  const updatedCheckedIn = updatedUsedTickets?.reduce((sum, t) => sum + t.quantity, 0) ?? tally.checkedIn + ticket.quantity

  return {
    status: 'success',
    name,
    eventTitle,
    eventDate,
    startTime,
    endTime,
    quantity: ticket.quantity,
    checkedInAt: now,
    tally: { ...tally, checkedIn: updatedCheckedIn },
  }
}
