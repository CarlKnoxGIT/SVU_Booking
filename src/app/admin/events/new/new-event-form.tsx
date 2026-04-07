'use client'

import { useActionState } from 'react'
import { createEvent } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ImageUpload } from '../image-upload'

type State = { error?: string } | null

export function NewEventForm() {
  const [state, formAction, pending] = useActionState(
    createEvent as (state: State, formData: FormData) => Promise<State>,
    null
  )

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-[12px] text-white/50 uppercase tracking-wide">
          Title
        </Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="e.g. Journey Through the Solar System"
          className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-[12px] text-white/50 uppercase tracking-wide">
          Description
        </Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Describe the experience…"
          className="w-full border border-white/10 bg-white/5 text-white text-[14px] px-3 py-2 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-1 focus:ring-swin-red resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event_date" className="text-[12px] text-white/50 uppercase tracking-wide">
            Date
          </Label>
          <Input
            id="event_date"
            name="event_date"
            type="date"
            required
            className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_time" className="text-[12px] text-white/50 uppercase tracking-wide">
            Start time
          </Label>
          <Input
            id="start_time"
            name="start_time"
            type="time"
            required
            className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time" className="text-[12px] text-white/50 uppercase tracking-wide">
            End time
          </Label>
          <Input
            id="end_time"
            name="end_time"
            type="time"
            required
            className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticket_price" className="text-[12px] text-white/50 uppercase tracking-wide">
            Ticket price (AUD)
          </Label>
          <Input
            id="ticket_price"
            name="ticket_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            placeholder="0.00"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red"
          />
          <p className="text-[11px] text-white/25">Set to 0 for free events</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_capacity" className="text-[12px] text-white/50 uppercase tracking-wide">
            Capacity
          </Label>
          <Input
            id="max_capacity"
            name="max_capacity"
            type="number"
            min="1"
            max="100"
            defaultValue="60"
            className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[12px] text-white/50 uppercase tracking-wide">Event image <span className="normal-case text-white/20">(optional)</span></Label>
        <ImageUpload name="image_url" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="humanitix_url" className="text-[12px] text-white/50 uppercase tracking-wide">
          Humanitix URL <span className="normal-case text-white/20">(optional — overrides Stripe checkout)</span>
        </Label>
        <Input
          id="humanitix_url"
          name="humanitix_url"
          type="url"
          placeholder="https://events.humanitix.com/…"
          className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red"
        />
      </div>

      <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-5 flex items-start gap-4">
        <div className="flex-1">
          <p className="text-[13px] font-medium text-white">Publish immediately</p>
          <p className="text-[12px] text-white/35 mt-0.5">
            Make this event visible on the public events page right away.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer mt-0.5">
          <input type="hidden" name="is_published" value="false" />
          <input
            type="checkbox"
            name="is_published"
            value="true"
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-white/10 peer-focus:ring-1 peer-focus:ring-swin-red rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-swin-red after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
        </label>
      </div>

      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-swin-red hover:bg-swin-red-hover text-white"
        >
          {pending ? 'Creating…' : 'Create event'}
        </Button>
        <Link
          href="/admin/events"
          className="inline-flex items-center px-4 py-2 text-[13px] text-white/40 hover:text-white/70 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
