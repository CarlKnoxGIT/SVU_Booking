export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createAdminClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, event_date, start_time, ticket_price, max_capacity, tickets_sold')
    .order('event_date', { ascending: false })

  const { data: tickets } = await supabase
    .from('tickets')
    .select('event_id, quantity, status')

  const map: Record<string, { sold: number; checkedIn: number; revenue: number }> = {}
  for (const t of tickets ?? []) {
    if (!map[t.event_id]) map[t.event_id] = { sold: 0, checkedIn: 0, revenue: 0 }
    if (t.status === 'active' || t.status === 'used') map[t.event_id].sold += t.quantity
    if (t.status === 'used') map[t.event_id].checkedIn += t.quantity
  }

  const header = ['Event', 'Date', 'Capacity', 'Tickets Sold', 'Checked In', 'No Shows', 'Revenue (AUD)']
  const rows = (events ?? []).map(e => {
    const stats = map[e.id] ?? { sold: 0, checkedIn: 0, revenue: 0 }
    const price = e.ticket_price ?? 0
    return [
      e.title,
      e.event_date ?? '',
      e.max_capacity,
      stats.sold,
      stats.checkedIn,
      stats.sold - stats.checkedIn,
      (stats.sold * price).toFixed(2),
    ]
  })

  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="svu-attendance-report.csv"`,
    },
  })
}
