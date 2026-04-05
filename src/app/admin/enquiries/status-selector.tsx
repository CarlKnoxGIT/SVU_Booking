'use client'

import { updateEnquiryStatus } from './actions'

export function EnquiryStatusSelector({ enquiryId, status }: { enquiryId: string; status: string }) {
  return (
    <form action={updateEnquiryStatus}>
      <input type="hidden" name="id" value={enquiryId} />
      <select
        name="status"
        defaultValue={status}
        onChange={e => (e.target.form as HTMLFormElement).requestSubmit()}
        className="bg-transparent text-[13px] text-white/60 border border-white/10 px-3 py-1 focus:outline-none focus:ring-1 focus:ring-swin-red [&>option]:bg-zinc-900 cursor-pointer rounded"
      >
        <option value="new">New</option>
        <option value="in_progress">In progress</option>
        <option value="closed">Closed</option>
      </select>
    </form>
  )
}
