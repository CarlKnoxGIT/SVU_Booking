import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { signOut } from './actions'

const NAV_ITEMS = [
  { href: '/staff', label: 'My Bookings' },
  { href: '/staff/book', label: 'New Booking' },
]

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/staff')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('auth_id', user.id)
    .single()

  const allowedRoles = ['staff', 'super_admin']
  if (!profile || !allowedRoles.includes(profile.role)) redirect('/')

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="w-52 flex-shrink-0 flex flex-col border-r border-white/[0.06]">
        <div className="px-5 pt-7 pb-6">
          <span className="text-[10px] font-bold tracking-[0.15em] text-indigo-400 uppercase">SVU</span>
          <p className="text-[10px] tracking-[0.1em] text-white/30 uppercase mt-0.5">Booking</p>
        </div>

        <nav className="flex-1 px-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
            >
              {item.label}
            </Link>
          ))}
          {profile?.role === 'super_admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-indigo-400/70 hover:text-indigo-300 hover:bg-white/[0.06] transition-all duration-150 mt-1"
            >
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-7 w-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-[11px] font-semibold text-indigo-300 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white truncate">
                {profile?.full_name?.split(' ')[0] ?? 'Staff'}
              </p>
              <p className="text-[10px] text-white/30 capitalize truncate">
                {profile?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full text-left text-[12px] text-white/25 hover:text-white/60 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
