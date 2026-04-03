'use client'

import { useActionState } from 'react'
import { createBookingRequest } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const BOOKING_TYPES = [
  { value: 'academic', label: 'Academic / Teaching', desc: 'Lecture, tutorial, or research session' },
  { value: 'research', label: 'Research', desc: 'Research data capture or visualisation' },
  { value: 'maintenance', label: 'Maintenance', desc: 'Hardware calibration or technical work' },
]

const DURATION_OPTIONS = [
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
]

type State = { error?: string } | null

export function BookingForm() {
  const [state, formAction, pending] = useActionState(
    createBookingRequest as (state: State, formData: FormData) => Promise<State>,
    null
  )

  // Default to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-6">
      {/* Booking type */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-300">Booking type</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {BOOKING_TYPES.map((type) => (
            <label
              key={type.value}
              className="relative flex cursor-pointer flex-col rounded-xl border border-white/10 bg-white/5 p-4 hover:border-indigo-500/50 hover:bg-white/10 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-500/10"
            >
              <input
                type="radio"
                name="booking_type"
                value={type.value}
                defaultChecked={type.value === 'academic'}
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
          placeholder="e.g. COS30049 Week 8 Lab"
          className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
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
          placeholder="Brief description of the session purpose and any special requirements…"
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
            min={defaultDate}
            className="border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500 [color-scheme:dark]"
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
            defaultValue="09:00"
            step="900"
            className="border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Duration + attendees */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration_minutes" className="text-zinc-300">
            Duration
          </Label>
          <select
            id="duration_minutes"
            name="duration_minutes"
            defaultValue="60"
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d.value} value={d.value} className="bg-zinc-900">
                {d.label}
              </option>
            ))}
          </select>
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
            placeholder="e.g. 25"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
      >
        {pending ? 'Submitting…' : 'Submit booking request'}
      </Button>
    </form>
  )
}
