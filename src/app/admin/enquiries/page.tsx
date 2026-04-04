import { createClient } from '@/lib/supabase/server'
import { updateEnquiryStatus } from './actions'

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-swin-red/10 text-swin-red-light',
  in_progress: 'bg-amber-500/10 text-amber-400',
  closed: 'bg-white/[0.06] text-white/30',
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  corporate: 'Corporate',
  product_launch: 'Product launch',
  conference: 'Conference',
  school: 'School group',
  private: 'Private',
  other: 'Other',
}

export default async function EnquiriesPage() {
  const supabase = await createClient()

  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('id, name, email, organisation, event_type, guest_count, preferred_date, message, status, created_at')
    .order('created_at', { ascending: false })

  const counts = {
    new: enquiries?.filter(e => e.status === 'new').length ?? 0,
    in_progress: enquiries?.filter(e => e.status === 'in_progress').length ?? 0,
    closed: enquiries?.filter(e => e.status === 'closed').length ?? 0,
  }

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Enquiries</h1>
          <p className="mt-1 text-sm text-white/35">Hire and school group contact submissions.</p>
        </div>
        <div className="flex gap-4 text-[12px]">
          <span className="text-swin-red-light">{counts.new} new</span>
          <span className="text-amber-400">{counts.in_progress} in progress</span>
          <span className="text-white/25">{counts.closed} closed</span>
        </div>
      </div>

      {enquiries && enquiries.length > 0 ? (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <details key={enquiry.id} className="group border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-all">
              <summary className="flex items-center gap-4 px-6 py-4 cursor-pointer list-none">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <p className="text-[14px] font-medium text-white truncate">{enquiry.name}</p>
                    {enquiry.organisation && (
                      <span className="text-[12px] text-white/30 truncate hidden sm:block">
                        {enquiry.organisation}
                      </span>
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

              {/* Expanded detail */}
              <div className="border-t border-white/[0.06] px-6 py-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <p className="text-[11px] text-white/25 uppercase tracking-wide mb-1">Contact</p>
                    <p className="text-white/70">{enquiry.name}</p>
                    <a href={`mailto:${enquiry.email}`} className="text-swin-red-light hover:text-swin-red-lighter transition-colors">
                      {enquiry.email}
                    </a>
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
                  <form action={updateEnquiryStatus}>
                    <input type="hidden" name="id" value={enquiry.id} />
                    <select
                      name="status"
                      defaultValue={enquiry.status}
                      onChange={e => (e.target.form as HTMLFormElement).requestSubmit()}
                      className="bg-transparent text-[13px] text-white/60 border border-white/10 px-3 py-1 focus:outline-none focus:ring-1 focus:ring-swin-red [&>option]:bg-zinc-900 cursor-pointer"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </form>
                  <a
                    href={`mailto:${enquiry.email}?subject=Re: Your SVU Enquiry`}
                    className="ml-auto text-[13px] text-swin-red-light hover:text-swin-red-lighter transition-colors"
                  >
                    Reply by email →
                  </a>
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="border border-white/[0.07] bg-white/[0.02] px-6 py-20 text-center">
          <p className="text-white/25 text-sm">No enquiries yet.</p>
        </div>
      )}
    </div>
  )
}
