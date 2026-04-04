import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
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
    .select('id, title, max_capacity, tickets_sold, ticket_price, is_free')
    .eq('id', eventId)
    .eq('is_published', true)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  if (!event.is_free && event.ticket_price > 0) {
    return NextResponse.json({ error: 'This event requires payment.' }, { status: 400 })
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
  const { error: ticketError } = await supabase.from('tickets').insert({
    event_id: eventId,
    user_id: userId,
    qr_code: crypto.randomUUID(),
    quantity,
    status: 'active',
  })

  if (ticketError) {
    return NextResponse.json({ error: 'Could not reserve tickets.' }, { status: 500 })
  }

  // Increment tickets_sold
  await supabase
    .from('events')
    .update({ tickets_sold: (event.tickets_sold ?? 0) + quantity })
    .eq('id', eventId)

  return NextResponse.json({ success: true })
}
