'use client'

import { useTransition } from 'react'
import { deleteUser } from './actions'

export function DeleteUserButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Delete this user? This cannot be undone.')) return
    startTransition(() => deleteUser(userId))
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="text-[12px] text-white/20 hover:text-red-400 transition-colors px-2 disabled:opacity-40"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
