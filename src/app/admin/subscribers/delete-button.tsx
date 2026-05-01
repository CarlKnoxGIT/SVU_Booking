'use client'

import { useTransition } from 'react'
import { deleteSubscriber } from './actions'

export function DeleteSubscriberButton({ id, email }: { id: string; email: string }) {
  const [pending, startTransition] = useTransition()

  const onClick = () => {
    if (!confirm(`Remove ${email} from the mailing list?`)) return
    startTransition(async () => {
      await deleteSubscriber(id)
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-sm text-white/35 hover:text-red-400 transition-colors disabled:opacity-50"
      title="Remove from mailing list"
    >
      {pending ? '…' : 'Remove'}
    </button>
  )
}
