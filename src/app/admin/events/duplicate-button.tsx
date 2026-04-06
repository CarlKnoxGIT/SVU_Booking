'use client'

import { useTransition } from 'react'
import { duplicateEvent } from './actions'

export function DuplicateEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => duplicateEvent(eventId))}
      className="text-[12px] text-white/25 hover:text-white/60 transition-colors disabled:opacity-40"
      title="Duplicate event"
    >
      {isPending ? 'Copying…' : 'Duplicate'}
    </button>
  )
}
