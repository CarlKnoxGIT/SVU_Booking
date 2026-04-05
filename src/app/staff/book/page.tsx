import { BookingCalendar } from './calendar'

export default function NewBookingPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <h1 className="text-[18px] font-light text-white">Book the SVU</h1>
        <p className="text-[12px] text-white/30 mt-0.5">Click any time slot to request a booking. All requests require admin approval.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <BookingCalendar />
      </div>
    </div>
  )
}
