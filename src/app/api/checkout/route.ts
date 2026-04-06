export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { eventId, quantity } = await req.json()

  if (!eventId || !quantity || quantity < 1) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify event exists, is published, and has capacity
  const { data: event, error } = await supabase
    .from('events')
    .select('id, title, event_date, start_time, ticket_price, max_capacity, tickets_sold, is_published')
    .eq('id', eventId)
    .eq('is_published', true)
    .single()

  if (error || !event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const remaining = event.max_capacity - (event.tickets_sold ?? 0)
  if (quantity > remaining) {
    return NextResponse.json({ error: 'Not enough tickets available' }, { status: 409 })
  }

  const unitPrice = Math.round(Number(event.ticket_price) * 100) // cents

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'aud',
          unit_amount: unitPrice,
          product_data: {
            name: event.title,
            description: `${new Date(event.event_date).toLocaleDateString('en-AU', { dateStyle: 'long' })} · ${event.start_time?.slice(0, 5)} · Swinburne's Virtual Universe`,
          },
        },
        quantity,
      },
    ],
    metadata: {
      event_id: eventId,
      quantity: String(quantity),
    },
    success_url: `${origin}${basePath}/events/${eventId}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${basePath}/events/${eventId}/tickets`,
  })

  return NextResponse.json({ url: session.url })
}
