import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AdminBookingCalendar } from './bookings/admin-calendar'
import { QrScanner } from './checkin/qr-scanner'
import { approveStaffRequest, rejectStaffRequest } from './staff-requests/actions'
import { EnquiryStatusSelector } from './enquiries/status-selector'
import { RoleSelector } from './users/role-selector'
import { DeleteUserButton } from './users/delete-button'
import { InviteStaff } from './users/invite-staff'
import { BroadcastForm } from './broadcast/broadcast-form'
import { DuplicateEventButton } from './events/duplicate-button'

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-swin-red/10 text-swin-red-light',
  in_progress: 'bg-amber-500/10 text-amber-400',
  closed: 'bg-white/[0.06] text-white/30',
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  corporate: 'Corporate', product_launch: 'Product launch', conference: 'Conference',
  school: 'School group', private: 'Private', other: 'Other',
}

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [
    bookingsCountRes,
    pendingBookingsRes,
    usersRes,
    eventsRes,
    ticketsRes,
    enquiriesRes,
    staffRequestsRes,
    recentBookingsRes,
  ] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('users').select('id, email, full_name, role, created_at').order('created_at', { ascending: false }),
    supabase.from('events').select('id, title, event_date, start_time, ticket_price, max_capacity, tickets_sold, is_published').order('event_date', { ascending: false }),
    supabase.from('tickets').select('event_id, status, quantity'),
    supabase.from('enquiries').select('id, name, email, organisation, event_type, guest_count, preferred_date, message, status, created_at').order('created_at', { ascending: false }),
    supabase.from('staff_requests').select('id, full_name, email, message, status, created_at').order('created_at', { ascending: false }),
    supabase.from('bookings').select('id, title, status, start_time, booking_type').order('created_at', { ascending: false }).limit(6),
  ])

  const users = usersRes.data ?? []
  const events = eventsRes.data ?? []
  const tickets = ticketsRes.data ?? []
  const enquiries = enquiriesRes.data ?? []
  const staffRequests = staffRequestsRes.data ?? []
  const recentBookings = recentBookingsRes.data ?? []

  const pendingStaffRequests = staffRequests.filter(r => r.status === 'pending')
  const reviewedStaffRequests = staffRequests.filter(r => r.status !== 'pending')

  const attendanceMap: Record<string, { checkedIn: number; total: number }> = {}
  for (const t of tickets) {
    if (!attendanceMap[t.event_id]) attendanceMap[t.event_id] = { checkedIn: 0, total: 0 }
    if (t.status === 'active' || t.status === 'used') attendanceMap[t.event_id].total += t.quantity
    if (t.status === 'used') attendanceMap[t.event_id].checkedIn += t.quantity
  }

  const enquiryCounts = {
    new: enquiries.filter(e => e.status === 'new').length,
    in_progress: enquiries.filter(e => e.status === 'in_progress').length,
  }

  const isPast = (dateStr: string) => new Date(dateStr) < new Date()

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

  return (
    <div className="max-w-5xl px-10 py-10 space-y-16">

      {/* ── Bookings ─────────────────────────────────── */}
      <section id="bookings">
        <SectionHeader title="Bookings" subtitle="Click any block to approve, decline, edit, or cancel.">
          <Link href="/admin/bookings" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
            Full view →
          </Link>
        </SectionHeader>
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ height: 640 }}>
          <AdminBookingCalendar />
        </div>
      </section>

      <Divider />

      {/* ── Overview ─────────────────────────────────── */}
      <section id="overview">
        <SectionHeader title="Overview" subtitle="SVU facility at a glance." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Bookings', value: bookingsCountRes.count ?? 0 },
            { label: 'Pending Approval', value: pendingBookingsRes.count ?? 0, highlight: (pendingBookingsRes.count ?? 0) > 0 },
            { label: 'Registered Users', value: users.length },
            { label: 'Events', value: events.length },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <p className="text-[11px] font-medium tracking-wide text-white/35 uppercase">{s.label}</p>
              <p className={`mt-3 text-4xl font-semibold tracking-tight ${s.highlight ? 'text-swin-red-light' : 'text-white'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
        {recentBookings.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/[0.07] overflow-hidden">
            <p className="px-6 py-3 text-[11px] font-semibold tracking-[0.12em] text-white/25 uppercase border-b border-white/[0.05]">
              Recent bookings
            </p>
            {recentBookings.map((b, i) => (
              <div key={b.id} className={`flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] ${i < recentBookings.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                <div>
                  <p className="text-[13px] font-medium text-white">{b.title}</p>
                  <p className="text-[11px] text-white/30 capitalize mt-0.5">
                    {b.booking_type.replace('_', ' ')}
                    {b.start_time && <> · {new Date(b.start_time).toLocaleDateString('en-AU', { dateStyle: 'medium' })}</>}
                  </p>
                </div>
                <StatusPill status={b.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <Divider />

      {/* ── Staff Requests ───────────────────────────── */}
      <section id="staff-requests">
        <SectionHeader
          title="Staff Requests"
          subtitle="Approve to send an invite. Reject to notify the applicant."
          badge={pendingStaffRequests.length > 0 ? `${pendingStaffRequests.length} pending` : undefined}
        />

        {pendingStaffRequests.length === 0 ? (
          <EmptyCard>No pending staff requests.</EmptyCard>
        ) : (
          <div className="space-y-3 mb-6">
            {pendingStaffRequests.map(r => (
              <div key={r.id} className="rounded-2xl border border-amber-500/15 bg-white/[0.02] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-white">{r.full_name}</p>
                    <p className="text-[12px] text-white/40 mt-0.5">{r.email}</p>
                    {r.message && <p className="text-[12px] text-white/25 mt-2 italic">"{r.message}"</p>}
                    <p className="text-[11px] text-white/15 mt-2">
                      {new Date(r.created_at).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <form action={async () => { 'use server'; await approveStaffRequest(r.id) }}>
                      <button type="submit" className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[12px] font-medium hover:bg-emerald-500/25 transition-colors rounded-lg">
                        Approve
                      </button>
                    </form>
                    <form action={async () => { 'use server'; await rejectStaffRequest(r.id) }}>
                      <button type="submit" className="px-4 py-2 bg-white/[0.03] border border-white/10 text-white/30 text-[12px] hover:text-white/60 transition-colors rounded-lg">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviewedStaffRequests.length > 0 && (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            <p className="px-6 py-3 text-[11px] font-semibold tracking-[0.12em] text-white/25 uppercase border-b border-white/[0.05]">
              Reviewed ({reviewedStaffRequests.length})
            </p>
            {reviewedStaffRequests.map((r, i) => (
              <div key={r.id} className={`flex items-center justify-between px-6 py-3.5 ${i < reviewedStaffRequests.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                <div>
                  <p className="text-[13px] text-white/60">{r.full_name}</p>
                  <p className="text-[11px] text-white/25">{r.email}</p>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Divider />

      {/* ── Events ───────────────────────────────────── */}
      <section id="events">
        <SectionHeader title="Events" subtitle="Manage public events and ticketing.">
          <div className="flex items-center gap-3">
            <a
              href={`${base}/api/admin/reports/attendance`}
              className="text-[12px] text-white/30 hover:text-white/60 transition-colors"
              title="Download attendance report"
            >
              ↓ Report
            </a>
            <Link href="/admin/events/new" className="rounded-xl bg-swin-red px-4 py-2 text-[12px] font-semibold text-white hover:bg-swin-red-hover transition-all">
              Create event
            </Link>
          </div>
        </SectionHeader>

        {events.length > 0 ? (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            {events.map((e, i) => {
              const att = attendanceMap[e.id]
              const past = e.event_date ? isPast(e.event_date) : false
              const noShows = att ? att.total - att.checkedIn : 0
              return (
                <div key={e.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors ${i < events.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-white truncate">{e.title}</p>
                    <p className="mt-0.5 text-[12px] text-white/35">
                      {e.event_date ? new Date(e.event_date).toLocaleDateString('en-AU', { dateStyle: 'medium' }) : '—'}
                      {e.start_time && <> · {e.start_time.slice(0, 5)}</>}
                      {' · '}
                      {e.ticket_price === 0 ? 'Free' : `$${e.ticket_price}`}
                      {' · '}
                      {e.tickets_sold ?? 0}/{e.max_capacity} sold
                    </p>
                    {att && att.total > 0 && (
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{att.checkedIn} checked in
                        </span>
                        {noShows > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-white/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                            {noShows} {past ? 'no-show' : 'not yet arrived'}{noShows !== 1 && past ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${e.is_published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.06] text-white/35'}`}>
                      {e.is_published ? 'Published' : 'Draft'}
                    </span>
                    <a
                      href={`${base}/api/admin/events/${e.id}/guests`}
                      className="text-[12px] text-white/25 hover:text-white/60 transition-colors"
                      title="Download guest list CSV"
                    >
                      ↓ Guests
                    </a>
                    <DuplicateEventButton eventId={e.id} />
                    <Link href={`/admin/events/${e.id}/edit`} className="text-[12px] text-white/25 hover:text-white/60 transition-colors">
                      Edit
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyCard>
            No events yet.{' '}
            <Link href="/admin/events/new" className="text-swin-red-light hover:text-swin-red-lighter">
              Create your first event →
            </Link>
          </EmptyCard>
        )}
      </section>

      <Divider />

      {/* ── Enquiries ────────────────────────────────── */}
      <section id="enquiries">
        <SectionHeader title="Enquiries" subtitle="Hire and school group contact submissions.">
          {(enquiryCounts.new > 0 || enquiryCounts.in_progress > 0) && (
            <div className="flex gap-4 text-[12px]">
              {enquiryCounts.new > 0 && <span className="text-swin-red-light">{enquiryCounts.new} new</span>}
              {enquiryCounts.in_progress > 0 && <span className="text-amber-400">{enquiryCounts.in_progress} in progress</span>}
            </div>
          )}
        </SectionHeader>

        {enquiries.length > 0 ? (
          <div className="space-y-3">
            {enquiries.map(enquiry => (
              <details key={enquiry.id} className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-all overflow-hidden">
                <summary className="flex items-center gap-4 px-6 py-4 cursor-pointer list-none">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <p className="text-[14px] font-medium text-white truncate">{enquiry.name}</p>
                      {enquiry.organisation && (
                        <span className="text-[12px] text-white/30 truncate hidden sm:block">{enquiry.organisation}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-white/35">
                      <span>{EVENT_TYPE_LABELS[enquiry.event_type] ?? enquiry.event_type}</span>
                      {enquiry.guest_count && <><span className="text-white/20">·</span><span>{enquiry.guest_count} guests</span></>}
                      {enquiry.preferred_date && <><span className="text-white/20">·</span><span>{enquiry.preferred_date}</span></>}
                      <span className="text-white/20">·</span>
                      <span>{new Date(enquiry.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[enquiry.status] ?? STATUS_STYLES.new}`}>
                    {enquiry.status.replace('_', ' ')}
                  </span>
                  <svg className="h-4 w-4 text-white/20 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t border-white/[0.06] px-6 py-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                    <div>
                      <p className="text-[11px] text-white/25 uppercase tracking-wide mb-1">Contact</p>
                      <p className="text-white/70">{enquiry.name}</p>
                      <a href={`mailto:${enquiry.email}`} className="text-swin-red-light hover:text-swin-red-lighter transition-colors">{enquiry.email}</a>
                    </div>
                    {enquiry.organisation && (
                      <div>
                        <p className="text-[11px] text-white/25 uppercase tracking-wide mb-1">Organisation</p>
                        <p className="text-white/70">{enquiry.organisation}</p>
                      </div>
                    )}
                  </div>
                  {enquiry.message && (
                    <div>
                      <p className="text-[11px] text-white/25 uppercase tracking-wide mb-2">Message</p>
                      <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/[0.05]">
                    <p className="text-[11px] text-white/25 uppercase tracking-wide">Status</p>
                    <EnquiryStatusSelector enquiryId={enquiry.id} status={enquiry.status} />
                    <a href={`mailto:${enquiry.email}?subject=Re: Your SVU Enquiry`} className="ml-auto text-[13px] text-swin-red-light hover:text-swin-red-lighter transition-colors">
                      Reply by email →
                    </a>
                  </div>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <EmptyCard>No enquiries yet.</EmptyCard>
        )}
      </section>

      <Divider />

      {/* ── Check-in ─────────────────────────────────── */}
      <section id="checkin">
        <SectionHeader title="Check-in" subtitle="Scan a ticket QR code to mark attendance." />
        <div className="max-w-sm">
          <QrScanner />
        </div>
      </section>

      <Divider />

      {/* ── Users ────────────────────────────────────── */}
      <section id="users">
        <SectionHeader title="Users" subtitle="Manage user accounts and roles." />

        <div className="mb-6">
          <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase mb-3">Invite staff</p>
          <InviteStaff />
        </div>

        {users.length > 0 ? (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            {users.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors ${i < users.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                <div className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[12px] font-semibold text-white/50 flex-shrink-0">
                  {u.full_name
                    ? u.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : u.email?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-white truncate">{u.full_name ?? u.email}</p>
                  {u.full_name && <p className="text-[12px] text-white/35 truncate">{u.email}</p>}
                </div>
                <RoleSelector userId={u.id} role={u.role} />
                <DeleteUserButton userId={u.id} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyCard>No users yet.</EmptyCard>
        )}
      </section>

      <Divider />

      {/* ── Broadcast ────────────────────────────────── */}
      <section id="broadcast">
        <SectionHeader
          title="Broadcast"
          subtitle="Send an email to all staff with confirmed bookings in a date range."
        />
        <BroadcastForm />
      </section>

      <div className="h-16" />
    </div>
  )
}

// ── Shared components ──────────────────────────────────────

function SectionHeader({
  title, subtitle, badge, children,
}: {
  title: string
  subtitle?: string
  badge?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-0.5 text-[13px] text-white/35">{subtitle}</p>}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  )
}

function Divider() {
  return <hr className="border-white/[0.05]" />
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] px-6 py-12 text-center">
      <p className="text-[13px] text-white/25">{children}</p>
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
