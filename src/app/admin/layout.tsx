import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { signOut } from './actions'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/maintenance', label: 'Maintenance' },
  { href: '/admin/reports', label: 'Reports' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('auth_id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/')

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/10 flex flex-col">
        <div className="p-5 border-b border-white/10">
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">SVU Admin</p>
          <p className="mt-1 text-sm font-medium text-white truncate">
            {profile?.full_name ?? user.email}
          </p>
        </div>

        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-5 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={signOut} className="p-4 border-t border-white/10">
          <button
            type="submit"
            className="w-full text-left text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </form>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
