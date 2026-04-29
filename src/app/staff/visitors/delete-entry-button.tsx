'use client'

import { useTransition } from 'react'
import { deleteVisitorEntry } from './actions'

interface Props {
  id: string
  summary: string
}

export function DeleteEntryButton({ id, summary }: Props) {
  const [pending, start] = useTransition()

  const handleClick = () => {
    if (!window.confirm(`Delete this entry? (${summary})`)) return
    start(async () => {
      const res = await deleteVisitorEntry(id)
      if (res?.error) window.alert(res.error)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-[11px] text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
    >
      {pending ? '…' : 'Delete'}
    </button>
  )
}
