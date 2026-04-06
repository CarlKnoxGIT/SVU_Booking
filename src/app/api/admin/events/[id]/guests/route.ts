export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('quantity, status, qr_code, created_at, users(full_name, email)')
    .eq('event_id', id)
    .in('status', ['active', 'used'])
    .order('created_at', { ascending: true })

  if (error) return new Response('Error fetching guests', { status: 500 })

  const { data: evt } = await supabase
    .from('events')
    .select('title, event_date')
    .eq('id', id)
    .single()

  const rows = (tickets ?? []).map((t) => {
    const user = Array.isArray(t.users) ? t.users[0] : t.users as { full_name: string | null; email: string | null } | null
    return [
      user?.full_name ?? '',
      user?.email ?? '',
      t.quantity,
      t.status,
      t.qr_code,
      new Date(t.created_at).toLocaleDateString('en-AU'),
    ]
  })

  const header = ['Name', 'Email', 'Quantity', 'Status', 'QR Code', 'Booked On']
  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const filename = `guests-${evt?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? id}-${evt?.event_date ?? 'event'}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
