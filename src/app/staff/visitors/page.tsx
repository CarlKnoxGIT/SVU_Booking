import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VisitorEntryForm } from './visitor-entry-form'
import { DeleteEntryButton } from './delete-entry-button'
import { ManageCategories } from './manage-categories'
import type { VisitorCategory, VisitorEntry } from '@/types'

export const dynamic = 'force-dynamic'

export default async function VisitorsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/staff/visitors')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  if (!profile || !['staff', 'super_admin'].includes(profile.role)) redirect('/')
  const isAdmin = profile.role === 'super_admin'

  const [{ data: categories }, { data: entries }] = await Promise.all([
    supabase
      .from('visitor_categories')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase
      .from('visitor_entries')
      .select('id, category_id, count, entry_date, note, recorded_by, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const cats: VisitorCategory[] = categories ?? []
  const activeCats = cats.filter((c) => c.is_active)
  const allEntries: VisitorEntry[] = (entries ?? []) as VisitorEntry[]

  // For totals across ALL entries, run a separate sum query
  const { data: totalsRows } = await supabase
    .from('visitor_entries')
    .select('category_id, count')

  const totalsByCategoryId: Record<string, number> = {}
  for (const r of totalsRows ?? []) {
    totalsByCategoryId[r.category_id] =
      (totalsByCategoryId[r.category_id] ?? 0) + (r.count ?? 0)
  }

  // Look up recorder names for the recent-entries table
  const recorderIds = Array.from(
    new Set(allEntries.map((e) => e.recorded_by).filter((v): v is string => !!v))
  )
  const recorderNames: Record<string, string> = {}
  if (recorderIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', recorderIds)
    for (const u of users ?? []) {
      recorderNames[u.id] = u.full_name ?? '—'
    }
  }

  const labelById = Object.fromEntries(cats.map((c) => [c.id, c.label]))

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        <header>
          <h1 className="text-2xl font-light text-white">Visitor counts</h1>
          <p className="mt-1 text-[13px] text-white/40">
            Add the numbers from each session. Totals show on the public landing page within a minute.
          </p>
        </header>

        {/* Totals strip */}
        <section>
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/40 mb-3">
            Cumulative totals
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {activeCats.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
              >
                <p className="text-[11px] uppercase tracking-wide text-white/45">{c.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {(totalsByCategoryId[c.id] ?? 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Entry form */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="text-[14px] font-medium text-white mb-4">Add new entry</h2>
          <VisitorEntryForm
            categories={activeCats.map((c) => ({ id: c.id, label: c.label }))}
            totalsByCategoryId={totalsByCategoryId}
          />
        </section>

        {/* Recent entries */}
        <section>
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/40 mb-3">
            Recent entries
          </p>
          {allEntries.length === 0 ? (
            <p className="text-[13px] text-white/30">No entries yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
              <table className="w-full text-[13px]">
                <thead className="bg-white/[0.03] text-white/45">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">Category</th>
                    <th className="px-3 py-2 text-right font-medium">Count</th>
                    <th className="px-3 py-2 text-left font-medium">Note</th>
                    <th className="px-3 py-2 text-left font-medium">By</th>
                    {isAdmin && <th className="px-3 py-2 text-right font-medium" />}
                  </tr>
                </thead>
                <tbody>
                  {allEntries.map((e) => (
                    <tr key={e.id} className="border-t border-white/[0.05]">
                      <td className="px-3 py-2 text-white/70">{e.entry_date}</td>
                      <td className="px-3 py-2 text-white/70">{labelById[e.category_id] ?? '—'}</td>
                      <td className="px-3 py-2 text-right text-white">{e.count.toLocaleString()}</td>
                      <td className="px-3 py-2 text-white/55">{e.note ?? ''}</td>
                      <td className="px-3 py-2 text-white/40">
                        {(e.recorded_by && recorderNames[e.recorded_by]) || '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-3 py-2 text-right">
                          <DeleteEntryButton
                            id={e.id}
                            summary={`${e.count} ${labelById[e.category_id] ?? ''} on ${e.entry_date}`}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Manage categories — admin only */}
        {isAdmin && <ManageCategories categories={cats} />}
      </div>
    </div>
  )
}
