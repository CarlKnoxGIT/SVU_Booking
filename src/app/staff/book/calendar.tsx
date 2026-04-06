'use client'

import { useState, useEffect, useActionState, useCallback } from 'react'
import { getWeekBookings, createBookingRequest } from './actions'

const HOUR_HEIGHT = 64
const START_HOUR = 8
const END_HOUR = 20
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

const BOOKING_TYPES = [
  { value: 'academic', label: 'Academic / Teaching' },
  { value: 'school', label: 'School Group' },
  { value: 'public_event', label: 'Public Event' },
  { value: 'external_hire', label: 'External Hire' },
  { value: 'maintenance', label: 'Maintenance' },
]

const DURATION_OPTIONS = [
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
  { value: '360', label: '6 hours' },
  { value: '480', label: '8 hours' },
  { value: 'allday', label: 'All day (8am – 8pm)' },
  { value: 'custom', label: 'Custom…' },
]

type Booking = {
  id: string
  title: string
  status: string
  start_time: string
  end_time: string
  booking_type: string
  user_id: string
  users: { full_name: string | null } | null
}

function getMondayOf(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function BookingCalendar() {
  const [weekStart, setWeekStart] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [hourHeight, setHourHeight] = useState(Math.round(HOUR_HEIGHT * 0.44))

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const loadBookings = useCallback(async () => {
    const data = await getWeekBookings(formatDate(weekStart))
    console.log('[calendar] bookings loaded:', data)
    setBookings(data as unknown as Booking[])
  }, [weekStart])

  useEffect(() => { loadBookings() }, [loadBookings])

  function prevWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
  }
  function nextWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
  }
  function goToday() { setWeekStart(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }) }

  function handleSlotClick(date: Date, hour: number) {
    setSelectedSlot({ date: formatDate(date), hour })
    setPanelOpen(true)
  }

  function bookingForDay(day: Date) {
    return bookings.filter(b => isSameDay(new Date(b.start_time), day))
  }

  const isCurrentWeek = isSameDay(weekStart, new Date())
  const today = new Date()

  return (
    <div className="flex h-full">
      {/* Calendar */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${panelOpen ? 'mr-96' : ''}`}>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="p-1.5 rounded hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={nextWeek} className="p-1.5 rounded hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="text-[14px] font-medium text-white ml-2">
              {weekStart.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' — '}
              {days[6].toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isCurrentWeek && (
              <button onClick={goToday} className="text-[12px] text-white/40 hover:text-white transition-colors">
                Today
              </button>
            )}
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-1 py-1">
              <button
                onClick={() => setHourHeight(h => Math.max(28, h - 16))}
                className="w-6 h-6 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors text-[14px] leading-none"
                title="Zoom out"
              >−</button>
              <button
                onClick={() => setHourHeight(HOUR_HEIGHT)}
                className="px-2 text-[10px] text-white/30 hover:text-white/60 transition-colors tabular-nums"
                title="Reset zoom"
              >{Math.round((hourHeight / HOUR_HEIGHT) * 100)}%</button>
              <button
                onClick={() => setHourHeight(h => Math.min(120, h + 16))}
                className="w-6 h-6 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors text-[14px] leading-none"
                title="Zoom in"
              >+</button>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/30 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-400/70" />Academic</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-violet-400/70" />School</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-orange-400/70" />Public event</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-teal-400/70" />External hire</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-zinc-400/70" />Maintenance</span>
              <span className="text-white/15">·</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm border border-dashed border-white/40" />Pending</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm border border-white/40" />Confirmed</span>
            </div>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-white/[0.06]">
          <div /> {/* time gutter */}
          {days.map((day, i) => {
            const isToday = isSameDay(day, today)
            return (
              <div key={i} className="py-3 text-center border-l border-white/[0.04]">
                <p className="text-[10px] text-white/30 uppercase tracking-wide">
                  {day.toLocaleDateString('en-AU', { weekday: 'short' })}
                </p>
                <p className={`text-[15px] font-medium mt-0.5 ${isToday ? 'text-swin-red-light' : 'text-white/70'}`}>
                  {day.getDate()}
                </p>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[48px_repeat(7,1fr)]">
            {/* Time labels */}
            <div>
              {HOURS.map(h => (
                <div key={h} style={{ height: hourHeight }} className="flex items-start justify-end pr-2 pt-1">
                  <span className="text-[10px] text-white/20">{h}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, di) => {
              const dayBookings = bookingForDay(day)
              const isPast = day < today && !isSameDay(day, today)

              return (
                <div key={di} className="relative border-l border-white/[0.04]">
                  {/* Hour rows */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      style={{ height: hourHeight }}
                      className={`border-b border-white/[0.04] ${isPast ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.02]'} transition-colors`}
                      onClick={() => !isPast && handleSlotClick(day, h)}
                    />
                  ))}

                  {/* Booking blocks */}
                  {dayBookings.map(b => {
                    const start = new Date(b.start_time)
                    const end = new Date(b.end_time)
                    const startFrac = start.getHours() + start.getMinutes() / 60
                    const endFrac = end.getHours() + end.getMinutes() / 60
                    const top = (startFrac - START_HOUR) * hourHeight
                    const height = Math.max((endFrac - startFrac) * hourHeight, 20)

                    const typeColours: Record<string, string> = {
                      academic:      'bg-blue-500/25 border-blue-400/50 text-blue-200',
                      school:        'bg-violet-500/25 border-violet-400/50 text-violet-200',
                      public_event:  'bg-orange-500/25 border-orange-400/50 text-orange-200',
                      external_hire: 'bg-teal-500/25 border-teal-400/50 text-teal-200',
                      maintenance:   'bg-zinc-500/25 border-zinc-400/50 text-zinc-300',
                      recurring:     'bg-pink-500/25 border-pink-400/50 text-pink-200',
                    }
                    const base = typeColours[b.booking_type] ?? 'bg-white/10 border-white/20 text-white/60'
                    const pending = b.status === 'pending' ? 'opacity-60 border-dashed' : ''
                    const colours = `${base} ${pending}`

                    return (
                      <div
                        key={b.id}
                        style={{ top, height, left: 2, right: 2 }}
                        className={`absolute rounded border px-2 py-1 overflow-hidden pointer-events-none ${colours}`}
                      >
                        <p className="text-[11px] font-medium leading-tight truncate">{b.title}</p>
                        {height > 36 && (
                          <p className="text-[10px] opacity-60 truncate">
                            {start.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            {' – '}
                            {end.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </p>
                        )}
                        {height > 52 && b.users?.full_name && (
                          <p className="text-[10px] opacity-50 truncate">{b.users.full_name}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Booking panel */}
      {panelOpen && selectedSlot && (
        <BookingPanel
          slot={selectedSlot}
          onClose={() => { setPanelOpen(false); setSelectedSlot(null) }}
          onSuccess={() => { setPanelOpen(false); setSelectedSlot(null); loadBookings() }}
        />
      )}
    </div>
  )
}

function BookingPanel({
  slot,
  onClose,
  onSuccess,
}: {
  slot: { date: string; hour: number }
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, pending] = useActionState(
    async (prevState: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createBookingRequest(prevState, formData)
      if (result?.success) { onSuccess(); return result }
      return result
    },
    null
  )
  const [duration, setDuration] = useState('60')

  const defaultTime = `${String(slot.hour).padStart(2, '0')}:00`
  const isAllDay = duration === 'allday'
  const isCustom = duration === 'custom'

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-[#0a0a0a] border-l border-white/[0.07] flex flex-col z-40 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <div>
          <h2 className="text-[15px] font-medium text-white">New booking request</h2>
          <p className="text-[12px] text-white/30 mt-0.5">
            {new Date(slot.date + 'T12:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="start_date" value={slot.date} />

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">Title</label>
            <input
              name="title" required
              placeholder="e.g. COS30049 Week 8 Lab"
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 rounded"
            />
          </div>

          {/* Booking type */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">Type</label>
            <select
              name="booking_type" defaultValue="academic"
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/30 rounded"
            >
              {BOOKING_TYPES.map(t => (
                <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>
              ))}
            </select>
          </div>

          {/* Start time + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">Start</label>
              <input
                name="start_time" type="time" required
                defaultValue={isAllDay ? '08:00' : defaultTime} step="900"
                disabled={isAllDay}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/30 rounded [color-scheme:dark] disabled:opacity-40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">Duration</label>
              <select
                name="duration_minutes"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/30 rounded"
              >
                {DURATION_OPTIONS.map(d => (
                  <option key={d.value} value={d.value} className="bg-zinc-900">{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom end time */}
          {isCustom && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">End time</label>
              <input
                name="end_time" type="time" required
                defaultValue={`${String(Math.min(slot.hour + 1, 20)).padStart(2, '0')}:00`} step="900"
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/30 rounded [color-scheme:dark]"
              />
            </div>
          )}

          {/* Attendees */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">Expected attendees</label>
            <input
              name="attendee_count" type="number" min="1" max="100"
              placeholder="e.g. 25"
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 rounded"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">
              Notes <span className="normal-case font-normal text-white/20">(optional)</span>
            </label>
            <textarea
              name="description" rows={3}
              placeholder="Any special requirements…"
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 rounded resize-none"
            />
          </div>

          {state?.error && (
            <p className="text-[12px] text-red-400 border border-red-500/20 bg-red-500/10 px-3 py-2 rounded">
              {state.error}
            </p>
          )}

          <div className="pt-1 pb-4">
            <p className="text-[11px] text-white/20 mb-4">
              Your request will be reviewed by an admin before confirmation.
            </p>
            <button
              type="submit" disabled={pending}
              className="w-full py-3 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold rounded transition-colors disabled:opacity-50"
            >
              {pending ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
