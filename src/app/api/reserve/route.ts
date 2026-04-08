import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendTicketConfirmation } from '@/lib/email/send-ticket-confirmation'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { eventId, quantity, name, email } = await req.json()

  if (!eventId || !quantity || !name || !email) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Verify event exists, is published, is free, and has capacity
  const { data: event } = await supabase
    .from('events')
    .select('id, title, event_date, start_time, end_time, max_capacity, tickets_sold, ticket_price, is_free')
    .eq('id', eventId)
    .eq('is_published', true)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  if (!event.is_free && event.ticket_price > 0) {
    return NextResponse.json({ error: 'This event requires payment.' }, { status: 400 })
  }

  if (quantity > 6) {
    return NextResponse.json({ error: 'Maximum 6 tickets per order.' }, { status: 400 })
  }

  const remaining = event.max_capacity - (event.tickets_sold ?? 0)
  if (quantity > remaining) {
    return NextResponse.json({ error: 'Not enough spots available.' }, { status: 409 })
  }

  // Resolve or create user record
  let userId: string

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existingUser) {
    userId = existingUser.id
  } else {
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({ email: email.toLowerCase(), full_name: name, role: 'public' })
      .select('id')
      .single()

    if (userError || !newUser) {
      return NextResponse.json({ error: 'Could not create account.' }, { status: 500 })
    }
    userId = newUser.id
  }

  // Create ticket
  const qrCode = crypto.randomUUID()
  const { error: ticketError } = await supabase
    .from('tickets')
    .insert({
      event_id: eventId,
      user_id: userId,
      qr_code: qrCode,
      quantity,
      status: 'active',
      buyer_name: name,
    })

  if (ticketError) {
    return NextResponse.json({ error: 'Could not reserve tickets.' }, { status: 500 })
  }

  // Fetch cancel_token separately (column added in migration 010 — may not exist in older DBs)
  const { data: ticket } = await supabase
    .from('tickets')
    .select('cancel_token')
    .eq('qr_code', qrCode)
    .single()

  // tickets_sold is maintained by a DB trigger (migration 011) — no manual update needed

  // Send confirmation email in the background — do NOT await, it would hang the response
  const eventDate = new Date(event.event_date)
    .toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  void sendTicketConfirmation({
    to: email,
    name,
    eventTitle: event.title,
    eventDate,
    startTime: event.start_time?.slice(0, 5) ?? '',
    endTime: event.end_time?.slice(0, 5) ?? '',
    quantity,
    qrCode,
    cancelToken: ticket?.cancel_token ?? undefined,
  }).catch((err) => console.error('[reserve] email send failed:', err))

  return NextResponse.json({ success: true, qrCode })
}
