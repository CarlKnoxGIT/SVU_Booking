'use client'

import { rejectBooking } from './actions'

export function DeleteButton({ id }: { id: string }) {
  return (
    <form action={rejectBooking}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-[12px] text-white/20 hover:text-red-400 transition-colors"
        onClick={e => { if (!confirm('Cancel this booking?')) e.preventDefault() }}
      >
        Cancel
      </button>
    </form>
  )
}
