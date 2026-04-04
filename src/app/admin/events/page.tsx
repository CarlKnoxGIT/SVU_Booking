import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminEventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, description, event_date, start_time, ticket_price, max_capacity, tickets_sold, is_published')
    .order('event_date', { ascending: false })

  return (
    <div className="p-10 max-w-4xl">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Events</h1>
          <p className="mt-1 text-sm text-white/35">Manage public events and ticketing.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-500 transition-all"
        >
          Create event
        </Link>
      </div>

      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        {events && events.length > 0 ? (
          events.map((e, i) => (
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
                  {e.tickets_sold ?? 0}/{e.max_capacity} tickets sold
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${e.is_published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.06] text-white/35'}`}>
                {e.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          ))
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-white/25">No events yet.</p>
            <Link href="/admin/events/new" className="mt-3 inline-block text-[13px] text-indigo-400 hover:text-indigo-300">
              Create your first event →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
