'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

function QRIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 17.25h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

interface Props {
  isAdmin: boolean
  initials: string
}

export function StaffBottomNav({ isAdmin, initials }: Props) {
  const pathname = usePathname()

  const isCalendarActive = pathname === '/staff' || pathname.startsWith('/staff/book')
  const isCheckinActive = pathname.startsWith('/staff/checkin')
  const isAdminActive = pathname.startsWith('/admin')

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black/95 backdrop-blur-md border-t border-white/[0.08] flex items-stretch h-16">
      {/* Calendar */}
      <Link
        href="/staff"
        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${isCalendarActive ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
      >
        <CalendarIcon />
        <span className="text-[10px] font-medium tracking-wide">Calendar</span>
      </Link>

      {/* Check-in */}
      <Link
        href="/staff/checkin"
        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${isCheckinActive ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
      >
        <QRIcon />
        <span className="text-[10px] font-medium tracking-wide">Check-in</span>
      </Link>

      {/* Admin — only for super_admin */}
      {isAdmin && (
        <Link
          href="/admin"
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${isAdminActive ? 'text-swin-red-light' : 'text-swin-red-light/30 hover:text-swin-red-light/60'}`}
        >
          <AdminIcon />
          <span className="text-[10px] font-medium tracking-wide">Admin</span>
        </Link>
      )}

      {/* Profile — small, subtle, tucked to the right */}
      <Link
        href="/staff/profile"
        className="flex flex-col items-center justify-center px-4 gap-1 text-white/20 hover:text-white/40 transition-colors"
        aria-label="Profile settings"
      >
        <div className="h-7 w-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[10px] font-semibold">
          {initials}
        </div>
      </Link>
    </nav>
  )
}
