import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CancelBookingButton } from './cancel-booking-button'

export default async function StaffDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('auth_id', user!.id)
    .single()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, title, status, start_time, end_time, booking_type')
    .eq('user_id', profile?.id)
    .order('start_time', { ascending: true })
    .limit(20)

  const upcoming = bookings?.filter(
    (b) => b.start_time && new Date(b.start_time) >= new Date() && b.status !== 'cancelled'
  )
  const past = bookings?.filter(
    (b) => !b.start_time || new Date(b.start_time) < new Date() || b.status === 'cancelled'
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Your SVU booking history and upcoming sessions.</p>
        </div>
        <Link href="/staff/book" className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-swin-red hover:bg-swin-red-hover text-white transition-colors">
          New booking
        </Link>
      </div>

      {/* Upcoming */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Upcoming ({upcoming?.length ?? 0})
        </h2>
        {upcoming && upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        ) : (
          <EmptyState message="No upcoming bookings." cta />
        )}
      </section>

      {/* Past */}
      {past && past.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wide">Past</h2>
          <div className="space-y-3">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} muted />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

type Booking = {
  id: string
  title: string
  status: string
  start_time: string | null
  end_time: string | null
  booking_type: string
}

function BookingCard({ booking: b, muted }: { booking: Booking; muted?: boolean }) {
  const statusColours: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    confirmed: 'bg-green-500/10 text-green-400',
    cancelled: 'bg-red-500/10 text-red-400',
    completed: 'bg-zinc-500/10 text-zinc-400',
  }

  return (
    <div className={`flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 ${muted ? 'opacity-60' : ''}`}>
      <div>
        <p className="font-medium text-white">{b.title}</p>
        <p className="mt-0.5 text-xs text-zinc-500 capitalize">
          {b.booking_type.replace('_', ' ')}
          {b.start_time && (
            <>
              {' · '}
              {new Date(b.start_time).toLocaleString('en-AU', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColours[b.status] ?? 'bg-zinc-500/10 text-zinc-400'}`}
        >
          {b.status}
        </span>
        {(b.status === 'pending' || b.status === 'confirmed') && !muted && (
          <CancelBookingButton bookingId={b.id} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ message, cta }: { message: string; cta?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center">
      <p className="text-zinc-500">{message}</p>
      {cta && (
        <Link
          href="/staff/book"
          className="mt-4 inline-block text-sm text-swin-red-light hover:text-swin-red-lighter"
        >
          Book your first session →
        </Link>
      )}
    </div>
  )
}
