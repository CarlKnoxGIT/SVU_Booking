import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch summary counts in parallel
  const [bookingsRes, pendingRes, usersRes] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Bookings', value: bookingsRes.count ?? 0 },
    { label: 'Pending Approval', value: pendingRes.count ?? 0 },
    { label: 'Registered Users', value: usersRes.count ?? 0 },
    { label: 'Revenue (MTD)', value: '—' },
  ]

  // Recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('id, title, status, start_time, booking_type')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="p-8">
      <h1 className="mb-1 text-2xl font-bold text-white">Dashboard</h1>
      <p className="mb-8 text-sm text-zinc-500">
        Overview of SVU bookings and activity.
      </p>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-white/10 bg-white/5">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Recent Bookings
        </h2>
        {recentBookings && recentBookings.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Start</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-white">{b.title}</td>
                    <td className="px-4 py-3 text-zinc-400 capitalize">{b.booking_type}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {b.start_time
                        ? new Date(b.start_time).toLocaleString('en-AU', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-12 text-center text-zinc-500">
            No bookings yet.
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    confirmed: 'bg-green-500/10 text-green-400',
    cancelled: 'bg-red-500/10 text-red-400',
    completed: 'bg-zinc-500/10 text-zinc-400',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colours[status] ?? 'bg-zinc-500/10 text-zinc-400'}`}
    >
      {status}
    </span>
  )
}
