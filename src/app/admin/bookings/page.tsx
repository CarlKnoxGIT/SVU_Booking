import { createClient } from '@/lib/supabase/server'
import { approveBooking, rejectBooking } from './actions'

export default async function AdminBookingsPage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, title, status, start_time, end_time, booking_type, attendee_count, created_at,
      users ( full_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const pending = bookings?.filter((b) => b.status === 'pending') ?? []
  const rest = bookings?.filter((b) => b.status !== 'pending') ?? []

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Bookings</h1>
        <p className="mt-1 text-sm text-white/35">Review and manage all facility bookings.</p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-[11px] font-semibold tracking-[0.12em] text-amber-400/80 uppercase">
            Awaiting Approval · {pending.length}
          </h2>
          <div className="rounded-2xl border border-amber-500/15 overflow-hidden">
            {pending.map((b, i) => (
              <div
                key={b.id}
                className={`flex items-center gap-4 px-6 py-4 ${i < pending.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-white truncate">{b.title}</p>
                  <p className="mt-0.5 text-[12px] text-white/35">
                    {(b.users as { full_name?: string; email?: string } | null)?.full_name ?? (b.users as { full_name?: string; email?: string } | null)?.email ?? 'Unknown'}
                    {' · '}
                    <span className="capitalize">{b.booking_type.replace('_', ' ')}</span>
                    {b.start_time && (
                      <> · {new Date(b.start_time).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}</>
                    )}
                    {b.attendee_count && <> · {b.attendee_count} people</>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <form action={rejectBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      type="submit"
                      className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Decline
                    </button>
                  </form>
                  <form action={approveBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-swin-red px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-swin-red-hover transition-all"
                    >
                      Approve
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All other bookings */}
      <section>
        <h2 className="mb-4 text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
          All Bookings
        </h2>
        {rest.length > 0 ? (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            {rest.map((b, i) => (
              <div
                key={b.id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors ${i < rest.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-white truncate">{b.title}</p>
                  <p className="mt-0.5 text-[12px] text-white/35">
                    {(b.users as { full_name?: string; email?: string } | null)?.full_name ?? (b.users as { full_name?: string; email?: string } | null)?.email ?? 'Unknown'}
                    {' · '}
                    <span className="capitalize">{b.booking_type.replace('_', ' ')}</span>
                    {b.start_time && (
                      <> · {new Date(b.start_time).toLocaleDateString('en-AU', { dateStyle: 'medium' })}</>
                    )}
                  </p>
                </div>
                <StatusPill status={b.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] px-6 py-16 text-center">
            <p className="text-sm text-white/25">No bookings yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:   'bg-amber-500/10 text-amber-400',
    confirmed: 'bg-emerald-500/10 text-emerald-400',
    cancelled: 'bg-red-500/10 text-red-400',
    completed: 'bg-white/8 text-white/40',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${styles[status] ?? 'bg-white/8 text-white/40'}`}>
      {status}
    </span>
  )
}
