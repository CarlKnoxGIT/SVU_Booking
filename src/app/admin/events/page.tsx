import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminEventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, event_date, start_time, ticket_price, max_capacity, tickets_sold, is_published')
    .order('event_date', { ascending: false })

  // Attendance counts per event
  const { data: ticketCounts } = await supabase
    .from('tickets')
    .select('event_id, status, quantity')

  // Build a map: eventId -> { checkedIn, total }
  const attendanceMap: Record<string, { checkedIn: number; total: number }> = {}
  for (const t of ticketCounts ?? []) {
    if (!attendanceMap[t.event_id]) attendanceMap[t.event_id] = { checkedIn: 0, total: 0 }
    if (t.status === 'active' || t.status === 'used') {
      attendanceMap[t.event_id].total += t.quantity
    }
    if (t.status === 'used') {
      attendanceMap[t.event_id].checkedIn += t.quantity
    }
  }

  const isPast = (dateStr: string) => new Date(dateStr) < new Date()

  return (
    <div className="p-10 max-w-4xl">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Events</h1>
          <p className="mt-1 text-sm text-white/35">Manage public events and ticketing.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-xl bg-swin-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-swin-red-hover transition-all"
        >
          Create event
        </Link>
      </div>

      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        {events && events.length > 0 ? (
          events.map((e, i) => {
            const att = attendanceMap[e.id]
            const past = e.event_date ? isPast(e.event_date) : false
            const noShows = att ? att.total - att.checkedIn : 0

            return (
              <div
                key={e.id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors ${i < events.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-white truncate">{e.title}</p>
                  <p className="mt-0.5 text-[12px] text-white/35">
                    {e.event_date
                      ? new Date(e.event_date).toLocaleDateString('en-AU', { dateStyle: 'medium' })
                      : '—'}
                    {e.start_time && <> · {e.start_time.slice(0, 5)}</>}
                    {' · '}
                    {e.ticket_price === 0 ? 'Free' : `$${e.ticket_price}`}
                    {' · '}
                    {e.tickets_sold ?? 0}/{e.max_capacity} sold
                  </p>

                  {/* Attendance — only show if tickets exist */}
                  {att && att.total > 0 && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {att.checkedIn} checked in
                      </span>
                      {past && noShows > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-white/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                          {noShows} no-show{noShows !== 1 ? 's' : ''}
                        </span>
                      )}
                      {!past && noShows > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-white/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                          {noShows} not yet arrived
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${e.is_published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.06] text-white/35'}`}>
                    {e.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Link href={`/admin/events/${e.id}/edit`}
                    className="text-[12px] text-white/25 hover:text-white/60 transition-colors">
                    Edit
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-white/25">No events yet.</p>
            <Link href="/admin/events/new" className="mt-3 inline-block text-[13px] text-swin-red-light hover:text-swin-red-lighter">
              Create your first event →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
