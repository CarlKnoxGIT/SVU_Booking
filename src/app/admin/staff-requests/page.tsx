import { createAdminClient } from '@/lib/supabase/server'
import { approveStaffRequest, rejectStaffRequest } from './actions'

export default async function StaffRequestsPage() {
  const supabase = createAdminClient()

  const { data: requests } = await supabase
    .from('staff_requests')
    .select('id, full_name, email, message, status, created_at')
    .order('created_at', { ascending: false })

  const pending = requests?.filter(r => r.status === 'pending') ?? []
  const reviewed = requests?.filter(r => r.status !== 'pending') ?? []

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">Staff Requests</h1>
        <p className="text-white/30 text-[13px] mt-1">Approve to send an invite email. Reject to notify the applicant.</p>
      </div>

      {/* Pending */}
      <section className="mb-10">
        <p className="text-[11px] font-bold tracking-[0.14em] text-white/25 uppercase mb-4">
          Pending ({pending.length})
        </p>

        {pending.length === 0 ? (
          <div className="border border-white/[0.07] px-6 py-10 text-center">
            <p className="text-white/20 text-[13px]">No pending requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(r => (
              <div key={r.id} className="border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-white">{r.full_name}</p>
                    <p className="text-[12px] text-white/40 mt-0.5">{r.email}</p>
                    {r.message && (
                      <p className="text-[12px] text-white/25 mt-2 italic">"{r.message}"</p>
                    )}
                    <p className="text-[11px] text-white/15 mt-2">
                      {new Date(r.created_at).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <form action={async () => { 'use server'; await approveStaffRequest(r.id) }}>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[12px] font-medium hover:bg-emerald-500/30 transition-colors"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={async () => { 'use server'; await rejectStaffRequest(r.id) }}>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-white/[0.03] border border-white/10 text-white/30 text-[12px] hover:text-white/60 transition-colors"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <section>
          <p className="text-[11px] font-bold tracking-[0.14em] text-white/25 uppercase mb-4">
            Reviewed ({reviewed.length})
          </p>
          <div className="space-y-2">
            {reviewed.map(r => (
              <div key={r.id} className="border border-white/[0.05] px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-white/60">{r.full_name}</p>
                  <p className="text-[11px] text-white/25">{r.email}</p>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  r.status === 'approved'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
