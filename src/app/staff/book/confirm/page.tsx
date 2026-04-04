import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function BookingConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  if (!id) notFound()

  const supabase = await createClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, title, status, start_time, end_time, booking_type, attendee_count, description')
    .eq('id', id)
    .single()

  if (!booking) notFound()

  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 text-5xl">
          {booking.status === 'confirmed' ? '✅' : '🕐'}
        </div>
        <h1 className="text-2xl font-bold text-white">
          {booking.status === 'confirmed' ? 'Booking confirmed!' : 'Request submitted!'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {booking.status === 'confirmed'
            ? 'Your session has been auto-approved. A calendar invite will arrive shortly.'
            : "Your request is pending review. You'll receive an email once it's approved."}
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 text-left space-y-3">
          <Detail label="Session" value={booking.title} />
          <Detail label="Type" value={booking.booking_type.replace('_', ' ')} capitalize />
          <Detail label="Status" value={booking.status} capitalize />
          {booking.start_time && (
            <Detail
              label="Start"
              value={new Date(booking.start_time).toLocaleString('en-AU', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            />
          )}
          {booking.end_time && booking.start_time && (
            <Detail
              label="Duration"
              value={`${Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 60_000)} minutes`}
            />
          )}
          {booking.attendee_count && (
            <Detail label="Attendees" value={String(booking.attendee_count)} />
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/staff/book" className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10')}>
            Book another
          </Link>
          <Link href="/staff" className={cn(buttonVariants(), 'flex-1 bg-swin-red hover:bg-swin-red-hover text-white')}>
            My bookings
          </Link>
        </div>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
  capitalize,
}: {
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={`text-white font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  )
}
