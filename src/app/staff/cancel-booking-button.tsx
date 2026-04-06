'use client'

import { cancelBooking } from './actions'

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  return (
    <form action={cancelBooking.bind(null, bookingId)}>
      <button
        type="submit"
        className="text-[11px] text-white/20 hover:text-red-400 transition-colors"
        onClick={e => { if (!confirm('Cancel this booking?')) e.preventDefault() }}
      >
        Cancel
      </button>
    </form>
  )
}
