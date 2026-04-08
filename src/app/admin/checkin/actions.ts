'use server'

import { createAdminClient } from '@/lib/supabase/server'

export type CheckInResult =
  | { status: 'success'; name: string | null; eventTitle: string; quantity: number; checkedInAt: string }
  | { status: 'already_used'; name: string | null; eventTitle: string; quantity: number; checkedInAt: string }
  | { status: 'not_found' }
  | { status: 'error'; message: string }

export async function checkInTicket(qrCode: string): Promise<CheckInResult> {
  const supabase = createAdminClient()

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('id, status, quantity, checked_in_at, user_id, event_id')
    .eq('qr_code', qrCode.trim())
    .single()

  if (error || !ticket) return { status: 'not_found' }

  // Fetch event and user in parallel
  const [{ data: event }, { data: user }] = await Promise.all([
    supabase.from('events').select('title').eq('id', ticket.event_id).single(),
    supabase.from('users').select('full_name').eq('id', ticket.user_id).single(),
  ])

  const eventTitle = event?.title ?? 'Unknown event'
  const name = user?.full_name ?? null

  if (ticket.status === 'used') {
    return {
      status: 'already_used',
      name,
      eventTitle,
      quantity: ticket.quantity,
      checkedInAt: ticket.checked_in_at!,
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

  return {
    status: 'success',
    name,
    eventTitle,
    quantity: ticket.quantity,
    checkedInAt: now,
  }
}
