import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/server'
import { sendTicketConfirmation } from '@/lib/email/send-ticket-confirmation'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import crypto from 'crypto'

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
        const qty = Number(session.metadata?.quantity ?? 1)

        // Resolve or create user from Stripe customer email
        const customerEmail = session.customer_details?.email
        let userId: string | null = session.metadata?.user_id ?? null

        if (!userId && customerEmail) {
          const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', customerEmail)
            .single()

          if (existing) {
            userId = existing.id
          } else {
            const { data: guest } = await supabase
              .from('users')
              .insert({
                email: customerEmail,
                full_name: session.customer_details?.name ?? null,
                role: 'public',
              })
              .select('id')
              .single()
            userId = guest?.id ?? null
          }
        }

        if (userId) {
          // Record payment
          const { data: payment } = await supabase
            .from('payments')
            .insert({
              event_id: eventId,
              user_id: userId,
              stripe_payment_id: session.payment_intent as string,
              stripe_customer_id: session.customer as string,
              amount: (session.amount_total ?? 0) / 100,
              currency: session.currency ?? 'aud',
              status: 'succeeded',
            })
            .select('id')
            .single()

          // Create ticket record
          const qrCode = crypto.randomUUID()
          await supabase.from('tickets').insert({
            event_id: eventId,
            user_id: userId,
            payment_id: payment?.id ?? null,
            qr_code: qrCode,
            quantity: qty,
            status: 'active',
          })

          // Send confirmation email
          const { data: evtDetails } = await supabase
            .from('events')
            .select('title, event_date, start_time, end_time')
            .eq('id', eventId)
            .single()

          if (evtDetails) {
            const customerName = session.customer_details?.name ?? 'Guest'
            const customerEmail = session.customer_details?.email
            const eventDate = new Date(evtDetails.event_date).toLocaleDateString('en-AU', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })
            if (customerEmail) {
              await sendTicketConfirmation({
                to: customerEmail,
                name: customerName,
                eventTitle: evtDetails.title,
                eventDate,
                startTime: evtDetails.start_time?.slice(0, 5) ?? '',
                endTime: evtDetails.end_time?.slice(0, 5) ?? '',
                quantity: qty,
                qrCode,
              }).catch((err) => console.error('[stripe webhook] email send failed:', err))
            }
          }
        }

        // Increment tickets_sold
        const { data: evt } = await supabase
          .from('events')
          .select('tickets_sold')
          .eq('id', eventId)
          .single()

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
