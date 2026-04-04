import { createClient } from '@/lib/supabase/server'
import { updateUserRole } from './actions'

const ROLES = ['super_admin', 'staff', 'school', 'external', 'public'] as const
type Role = typeof ROLES[number]

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  staff: 'Staff',
  school: 'School',
  external: 'External',
  public: 'Public',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Users</h1>
        <p className="mt-1 text-sm text-white/35">Manage user accounts and roles.</p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        {users && users.length > 0 ? (
          users.map((u, i) => (
            <div
              key={u.id}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors ${i < users.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[12px] font-semibold text-white/50 flex-shrink-0">
                {u.full_name
                  ? u.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  : u.email?.[0]?.toUpperCase() ?? '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-white truncate">
                  {u.full_name ?? u.email}
                </p>
                {u.full_name && (
                  <p className="text-[12px] text-white/35 truncate">{u.email}</p>
                )}
              </div>

              {/* Role selector */}
              <form action={updateUserRole} className="flex-shrink-0">
                <input type="hidden" name="id" value={u.id} />
                <select
                  name="role"
                  defaultValue={u.role}
                  onChange={(e) => (e.target.form as HTMLFormElement).requestSubmit()}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark] cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-zinc-900">
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </form>
            </div>
          ))
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-white/25">No users yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
