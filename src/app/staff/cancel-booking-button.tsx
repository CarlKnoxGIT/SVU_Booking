'use client'

import { useTransition } from 'react'
import { cancelBooking } from './actions'

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Cancel this booking?')) return
    startTransition(() => cancelBooking(bookingId))
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="text-[11px] text-white/20 hover:text-red-400 transition-colors disabled:opacity-40"
    >
      {pending ? 'Cancelling…' : 'Cancel'}
    </button>
  )
}
