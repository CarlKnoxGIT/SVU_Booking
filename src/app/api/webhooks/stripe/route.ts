import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.booking_id
      const eventId = session.metadata?.event_id

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId)

        await supabase.from('payments').insert({
          booking_id: bookingId,
          user_id: session.metadata?.user_id,
          stripe_payment_id: session.payment_intent as string,
          stripe_customer_id: session.customer as string,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? 'aud',
          status: 'succeeded',
        })
      }

      if (eventId) {
        // Increment tickets_sold
        const { data: evt } = await supabase
          .from('events')
          .select('tickets_sold')
          .eq('id', eventId)
          .single()

        const qty = Number(session.metadata?.quantity ?? 1)
        await supabase
          .from('events')
          .update({ tickets_sold: (evt?.tickets_sold ?? 0) + qty })
          .eq('id', eventId)
      }

      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          stripe_refund_id: charge.refunds?.data?.[0]?.id ?? null,
        })
        .eq('stripe_payment_id', charge.payment_intent as string)
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_id', pi.id)
      break
    }

    default:
      // Unhandled event type — log and return 200 so Stripe doesn't retry
      console.log(`Unhandled Stripe event: ${event.type}`)
  }

  return new Response('OK', { status: 200 })
}
