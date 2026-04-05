'use client'

import { updateUserRole } from './actions'

const ROLES = ['super_admin', 'staff', 'school', 'external', 'public'] as const
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin', staff: 'Staff', school: 'School',
  external: 'External', public: 'Public',
}

export function RoleSelector({ userId, role }: { userId: string; role: string }) {
  return (
    <form action={updateUserRole}>
      <input type="hidden" name="id" value={userId} />
      <select
        name="role"
        defaultValue={role}
        onChange={e => (e.target.form as HTMLFormElement).requestSubmit()}
        className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70 focus:outline-none focus:ring-1 focus:ring-swin-red [color-scheme:dark] cursor-pointer"
      >
        {ROLES.map(r => (
          <option key={r} value={r} className="bg-zinc-900">{ROLE_LABELS[r]}</option>
        ))}
      </select>
    </form>
  )
}
