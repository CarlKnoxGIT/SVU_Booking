export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Look up ticket by cancel token, join event details
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('id, status, quantity, event_id, payment_id, events(title, event_date, start_time)')
    .eq('cancel_token', token)
    .single()

  if (error || !ticket) {
    return NextResponse.json({ error: 'Invalid or expired cancellation link.' }, { status: 404 })
  }

  if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
    return NextResponse.json({ error: 'This ticket has already been cancelled.' }, { status: 409 })
  }

  if (ticket.status === 'used') {
    return NextResponse.json({ error: 'This ticket has already been used for entry.' }, { status: 409 })
  }

  // Block cancellation within 24 hours of the event
  const event = Array.isArray(ticket.events) ? ticket.events[0] : ticket.events
  if (event?.event_date && event?.start_time) {
    const eventStart = new Date(`${event.event_date}T${event.start_time}`)
    const hoursUntilEvent = (eventStart.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntilEvent < 24) {
      return NextResponse.json(
        { error: 'Tickets cannot be cancelled within 24 hours of the event.' },
        { status: 403 }
      )
    }
  }

  // Mark ticket cancelled
  const { error: cancelError } = await supabase
    .from('tickets')
    .update({ status: 'cancelled' })
    .eq('id', ticket.id)

  if (cancelError) {
    console.error('[cancel] ticket update failed:', cancelError)
    return NextResponse.json({ error: 'Failed to cancel ticket.' }, { status: 500 })
  }

  // tickets_sold is maintained by a DB trigger (migration 011) — no manual update needed

  // Issue Stripe refund if there's a payment
  let refunded = false
  if (ticket.payment_id) {
    const { data: payment } = await supabase
      .from('payments')
      .select('stripe_payment_id, amount, status')
      .eq('id', ticket.payment_id)
      .single()

    if (payment?.stripe_payment_id && payment.status === 'succeeded' && payment.amount > 0) {
      try {
        const stripe = getStripe()
        await stripe.refunds.create({ payment_intent: payment.stripe_payment_id })

        await supabase
          .from('payments')
          .update({ status: 'refunded' })
          .eq('id', ticket.payment_id)

        await supabase
          .from('tickets')
          .update({ status: 'refunded' })
          .eq('id', ticket.id)

        refunded = true
      } catch (err) {
        console.error('[cancel] Stripe refund failed:', err)
        // Ticket is already cancelled — refund failure shouldn't block the response
      }
    }
  }

  return NextResponse.json({ success: true, refunded })
}
