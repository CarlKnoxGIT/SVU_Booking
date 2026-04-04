import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [bookingsRes, pendingRes, usersRes] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Bookings', value: bookingsRes.count ?? 0 },
    { label: 'Pending Approval', value: pendingRes.count ?? 0, highlight: (pendingRes.count ?? 0) > 0 },
    { label: 'Registered Users', value: usersRes.count ?? 0 },
    { label: 'Revenue MTD', value: '—' },
  ]

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('id, title, status, start_time, booking_type')
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="p-10 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/35">Overview of SVU bookings and activity.</p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="text-[11px] font-medium tracking-wide text-white/35 uppercase">{s.label}</p>
            <p className={`mt-3 text-4xl font-semibold tracking-tight ${s.highlight ? 'text-indigo-400' : 'text-white'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <h2 className="mb-5 text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
          Recent Bookings
        </h2>

        {recentBookings && recentBookings.length > 0 ? (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            {recentBookings.map((b, i) => (
              <div
                key={b.id}
                className={`flex items-center justify-between px-6 py-4 ${
                  i < recentBookings.length - 1 ? 'border-b border-white/[0.05]' : ''
                } hover:bg-white/[0.02] transition-colors`}
              >
                <div>
                  <p className="text-[14px] font-medium text-white">{b.title}</p>
                  <p className="mt-0.5 text-[12px] text-white/35 capitalize">
                    {b.booking_type.replace('_', ' ')}
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
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-sm text-white/25">No bookings yet.</p>
          </div>
        )}
      </div>
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
