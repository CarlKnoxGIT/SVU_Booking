'use client'

import { deleteUser } from './actions'

export function DeleteUserButton({ userId }: { userId: string }) {
  return (
    <form action={deleteUser.bind(null, userId)}>
      <button
        type="submit"
        className="text-[12px] text-white/20 hover:text-red-400 transition-colors px-2"
        onClick={e => { if (!confirm('Delete this user?')) e.preventDefault() }}
      >
        Delete
      </button>
    </form>
  )
}
