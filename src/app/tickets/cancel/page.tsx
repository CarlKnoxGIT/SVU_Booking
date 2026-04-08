import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SwinburneLogo from '@/components/swinburne-logo'
import CancelForm from './cancel-form'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function CancelTicketPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <ErrorPage message="No cancellation token provided." />
  }

  const supabase = createAdminClient()

  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, status, quantity, event_id, payment_id, events(title, event_date, start_time, end_time, ticket_price)')
    .eq('cancel_token', token)
    .single()

  if (!ticket) {
    return <ErrorPage message="Invalid or expired cancellation link." />
  }

  if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
    return <ErrorPage message="This ticket has already been cancelled." />
  }

  if (ticket.status === 'used') {
    return <ErrorPage message="This ticket has already been used for entry and cannot be cancelled." />
  }

  const event = Array.isArray(ticket.events) ? ticket.events[0] : ticket.events

  // Check 24-hour cutoff
  let tooLate = false
  if (event?.event_date && event?.start_time) {
    const eventStart = new Date(`${event.event_date}T${event.start_time}`)
    tooLate = (eventStart.getTime() - Date.now()) / (1000 * 60 * 60) < 24
  }

  const isPaid = ticket.payment_id && Number(event?.ticket_price ?? 0) > 0
  const ticketWord = ticket.quantity === 1 ? 'ticket' : 'tickets'

  const formattedDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString('en-AU', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-6">
        <Link href="/">
          <SwinburneLogo className="h-8 w-auto" />
        </Link>
      </nav>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-[11px] font-bold tracking-[0.18em] text-white/30 uppercase mb-6">
            Swinburne's Virtual Universe
          </p>

          <h1 className="text-3xl font-light mb-2">Cancel tickets</h1>
          <p className="text-white/50 text-sm mb-8">
            You're about to cancel {ticket.quantity} {ticketWord} for the following event.
          </p>

          {/* Event summary */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-8">
            <p className="text-[11px] font-semibold tracking-wide text-white/30 uppercase mb-1">Event</p>
            <p className="text-white font-semibold text-lg mb-4">{event?.title ?? '—'}</p>

            {formattedDate && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold tracking-wide text-white/30 uppercase mb-0.5">Date</p>
                <p className="text-white/70 text-sm">{formattedDate}</p>
              </div>
            )}

            {event?.start_time && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold tracking-wide text-white/30 uppercase mb-0.5">Time</p>
                <p className="text-white/70 text-sm">
                  {event.start_time.slice(0, 5)}{event.end_time ? `–${event.end_time.slice(0, 5)}` : ''}
                </p>
              </div>
            )}

            <div>
              <p className="text-[11px] font-semibold tracking-wide text-white/30 uppercase mb-0.5">Tickets</p>
              <p className="text-white/70 text-sm">{ticket.quantity} × {event?.title ?? 'ticket'}</p>
            </div>
          </div>

          {tooLate ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-5 py-4 text-sm text-red-300">
              Cancellations are not accepted within 24 hours of the event.
            </div>
          ) : (
            <>
              {isPaid && (
                <p className="text-white/50 text-sm mb-6">
                  A full refund will be issued to your original payment method. Allow 5–10 business days.
                </p>
              )}
              <CancelForm token={token} />
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function ErrorPage({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center px-8 py-6">
        <Link href="/">
          <SwinburneLogo className="h-8 w-auto" />
        </Link>
      </nav>
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-[11px] font-bold tracking-[0.18em] text-white/30 uppercase mb-6">
            Swinburne's Virtual Universe
          </p>
          <p className="text-white/60 text-sm">{message}</p>
          <Link href="/events" className="mt-6 inline-block text-sm text-white/40 hover:text-white/70 underline transition-colors">
            Browse events
          </Link>
        </div>
      </div>
    </main>
  )
}
