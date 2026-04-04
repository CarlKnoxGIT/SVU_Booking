'use client'

import { useActionState } from 'react'
import { updateEvent, deleteEvent } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

type State = { error?: string } | null

interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  start_time: string
  end_time: string
  ticket_price: number | null
  max_capacity: number
  humanitix_url: string | null
  is_published: boolean
}

export function EditEventForm({ event }: { event: Event }) {
  const [state, formAction, pending] = useActionState(
    updateEvent as (state: State, formData: FormData) => Promise<State>,
    null
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="space-y-10">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={event.id} />

        <div className="space-y-2">
          <Label htmlFor="title" className="text-[12px] text-white/50 uppercase tracking-wide">Title</Label>
          <Input id="title" name="title" required defaultValue={event.title}
            className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-[12px] text-white/50 uppercase tracking-wide">Description</Label>
          <textarea id="description" name="description" rows={3} defaultValue={event.description ?? ''}
            className="w-full border border-white/10 bg-white/5 text-white text-[14px] px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-swin-red resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event_date" className="text-[12px] text-white/50 uppercase tracking-wide">Date</Label>
            <Input id="event_date" name="event_date" type="date" required defaultValue={event.event_date}
              className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time" className="text-[12px] text-white/50 uppercase tracking-wide">Start</Label>
            <Input id="start_time" name="start_time" type="time" required defaultValue={event.start_time?.slice(0, 5)}
              className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time" className="text-[12px] text-white/50 uppercase tracking-wide">End</Label>
            <Input id="end_time" name="end_time" type="time" required defaultValue={event.end_time?.slice(0, 5)}
              className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ticket_price" className="text-[12px] text-white/50 uppercase tracking-wide">Price (AUD)</Label>
            <Input id="ticket_price" name="ticket_price" type="number" min="0" step="0.01"
              defaultValue={event.ticket_price ?? 0}
              className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_capacity" className="text-[12px] text-white/50 uppercase tracking-wide">Capacity</Label>
            <Input id="max_capacity" name="max_capacity" type="number" min="1" max="60"
              defaultValue={event.max_capacity}
              className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="humanitix_url" className="text-[12px] text-white/50 uppercase tracking-wide">
            Humanitix URL <span className="normal-case text-white/20">(optional)</span>
          </Label>
          <Input id="humanitix_url" name="humanitix_url" type="url"
            defaultValue={event.humanitix_url ?? ''}
            placeholder="https://events.humanitix.com/…"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red" />
        </div>

        <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-white">Published</p>
            <p className="text-[12px] text-white/35 mt-0.5">Visible on the public events page.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="hidden" name="is_published" value="false" />
            <input type="checkbox" name="is_published" value="true" className="sr-only peer"
              defaultChecked={event.is_published} />
            <div className="w-10 h-6 bg-white/10 peer-focus:ring-1 peer-focus:ring-swin-red rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-swin-red after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={pending} className="bg-swin-red hover:bg-swin-red-hover text-white">
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
          <Link href="/admin/events" className="inline-flex items-center px-4 py-2 text-[13px] text-white/40 hover:text-white/70 transition-colors">
            Cancel
          </Link>
        </div>
      </form>

      {/* Delete zone */}
      <div className="border border-red-500/20 bg-red-500/5 p-5 rounded-xl">
        <p className="text-[13px] font-medium text-white mb-1">Delete event</p>
        <p className="text-[12px] text-white/35 mb-4">This cannot be undone. Any tickets already sold will remain in the database.</p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="text-[13px] text-red-400 hover:text-red-300 transition-colors">
            Delete this event
          </button>
        ) : (
          <form action={deleteEvent} className="flex gap-3 items-center">
            <input type="hidden" name="id" value={event.id} />
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-[13px]">
              Confirm delete
            </Button>
            <button type="button" onClick={() => setConfirmDelete(false)}
              className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
