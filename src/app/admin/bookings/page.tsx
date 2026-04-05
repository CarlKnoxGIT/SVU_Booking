import { AdminBookingCalendar } from './admin-calendar'
import { createAdminClient } from '@/lib/supabase/server'
import { approveBooking, rejectBooking } from './actions'
import { DeleteButton } from './delete-button'

export default async function AdminBookingsPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-5 border-b border-white/[0.06] flex-shrink-0">
        <h1 className="text-[18px] font-light text-white">Bookings</h1>
        <p className="text-[12px] text-white/30 mt-0.5">Click any booking to approve, decline, or cancel.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <AdminBookingCalendar />
      </div>
    </div>
  )
}
