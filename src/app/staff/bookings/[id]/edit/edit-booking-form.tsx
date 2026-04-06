'use client'

import { useActionState } from 'react'
import { updateBooking } from './actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const BOOKING_TYPES = [
  { value: 'academic', label: 'Academic / Teaching', desc: 'Lecture, tutorial, or research session' },
  { value: 'research', label: 'Research', desc: 'Research data capture or visualisation' },
  { value: 'maintenance', label: 'Maintenance', desc: 'Hardware calibration or technical work' },
  { value: 'vip', label: 'VIP', desc: 'VIP or special guest visit' },
]

const DURATION_OPTIONS = [
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
  { value: 'custom', label: 'Custom end time' },
]

type Booking = {
  id: string
  title: string
  booking_type: string
  description: string | null
  start_time: string
  end_time: string
  attendee_count: number | null
}

type State = { error?: string } | null

export function EditBookingForm({ booking }: { booking: Booking }) {
  const updateWithId = updateBooking.bind(null, booking.id)
  const [state, formAction, pending] = useActionState(
    updateWithId as (state: State, formData: FormData) => Promise<State>,
    null
  )

  const startAt = new Date(booking.start_time)
  const endAt = new Date(booking.end_time)
  const defaultDate = startAt.toISOString().split('T')[0]
  const defaultStartTime = startAt.toTimeString().slice(0, 5)
  const defaultEndTime = endAt.toTimeString().slice(0, 5)

  return (
    <form action={formAction} className="space-y-6">
      {/* Booking type */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-300">Booking type</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {BOOKING_TYPES.map((type) => (
            <label
              key={type.value}
              className="relative flex cursor-pointer flex-col rounded-xl border border-white/10 bg-white/5 p-4 hover:border-swin-red/50 hover:bg-white/10 transition-colors has-[:checked]:border-swin-red has-[:checked]:bg-swin-red-hover/10"
            >
              <input
                type="radio"
                name="booking_type"
                value={type.value}
                defaultChecked={booking.booking_type === type.value}
                className="sr-only"
                required
              />
              <span className="font-medium text-white text-sm">{type.label}</span>
              <span className="mt-1 text-xs text-zinc-500">{type.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-300">
          Session title <span className="text-red-400">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={booking.title}
          className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-swin-red"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-300">
          Description <span className="text-zinc-600 text-xs">(optional)</span>
        </Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={booking.description ?? ''}
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-swin-red resize-none"
        />
      </div>

      {/* Date + time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date" className="text-zinc-300">
            Date <span className="text-red-400">*</span>
          </Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={defaultDate}
            className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_time" className="text-zinc-300">
            Start time <span className="text-red-400">*</span>
          </Label>
          <Input
            id="start_time"
            name="start_time"
            type="time"
            required
            defaultValue={defaultStartTime}
            step="900"
            className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Duration + attendees */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="end_time" className="text-zinc-300">
            End time <span className="text-red-400">*</span>
          </Label>
          <Input
            id="end_time"
            name="end_time"
            type="time"
            required
            defaultValue={defaultEndTime}
            step="900"
            className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attendee_count" className="text-zinc-300">
            Expected attendees
          </Label>
          <Input
            id="attendee_count"
            name="attendee_count"
            type="number"
            min="1"
            max="100"
            defaultValue={booking.attendee_count ?? ''}
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-swin-red"
          />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="flex-1 bg-swin-red hover:bg-swin-red-hover text-white"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
        <Link
          href="/staff"
          className="inline-flex items-center justify-center rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
