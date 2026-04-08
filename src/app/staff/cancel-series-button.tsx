'use client'

import { useTransition } from 'react'
import { cancelSeries } from './actions'

export function CancelSeriesButton({ seriesId }: { seriesId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Cancel all upcoming sessions in this recurring series?')) return
    startTransition(() => cancelSeries(seriesId))
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="text-[11px] text-white/20 hover:text-red-400 transition-colors disabled:opacity-40"
    >
      {pending ? 'Cancelling…' : 'Cancel series'}
    </button>
  )
}
