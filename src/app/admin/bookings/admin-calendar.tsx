'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { getAdminWeekBookings, approveBookingById, rejectBookingById } from './actions'

const HOUR_HEIGHT = 64
const START_HOUR = 8
const END_HOUR = 20
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

const TYPE_COLOURS: Record<string, { block: string; dot: string }> = {
  academic:      { block: 'bg-blue-500/25 border-blue-400/50 text-blue-200',     dot: 'bg-blue-400/70' },
  school:        { block: 'bg-violet-500/25 border-violet-400/50 text-violet-200', dot: 'bg-violet-400/70' },
  public_event:  { block: 'bg-orange-500/25 border-orange-400/50 text-orange-200', dot: 'bg-orange-400/70' },
  external_hire: { block: 'bg-teal-500/25 border-teal-400/50 text-teal-200',      dot: 'bg-teal-400/70' },
  maintenance:   { block: 'bg-zinc-500/25 border-zinc-400/50 text-zinc-300',      dot: 'bg-zinc-400/70' },
}

type Booking = {
  id: string
  title: string
  status: string
  start_time: string
  end_time: string
  booking_type: string
  attendee_count: number | null
  description: string | null
  user_id: string
  users: { full_name: string | null; email: string | null } | null
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

export function AdminBookingCalendar() {
  const [weekStart, setWeekStart] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selected, setSelected] = useState<Booking | null>(null)
  const [hourHeight, setHourHeight] = useState(Math.round(HOUR_HEIGHT * 0.44))
  const [loading, setLoading] = useState(false)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const loadBookings = useCallback(async () => {
    setLoading(true)
    const data = await getAdminWeekBookings(formatDate(weekStart))
    setBookings(data as unknown as Booking[])
    setLoading(false)
  }, [weekStart])

  useEffect(() => { loadBookings() }, [loadBookings])

  // Keep selected booking in sync after reload
  useEffect(() => {
    if (selected) {
      const updated = bookings.find(b => b.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [bookings]) // eslint-disable-line react-hooks/exhaustive-deps

  function prevWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
  }
  function nextWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
  }
  function goToday() { setWeekStart(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }) }

  function bookingsForDay(day: Date) {
    return bookings.filter(b => isSameDay(new Date(b.start_time), day))
  }

  const isCurrentWeek = isSameDay(weekStart, new Date())
  const today = new Date()
  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <div className="flex h-full">
      {/* Calendar */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${selected ? 'mr-[400px]' : ''}`}>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-wrap gap-3">
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
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                {pendingCount} pending
              </span>
            )}
            {loading && (
              <span className="ml-2 text-[11px] text-white/20 animate-pulse">loading…</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isCurrentWeek && (
              <button onClick={goToday} className="text-[12px] text-white/40 hover:text-white transition-colors">
                Today
              </button>
            )}
            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] text-white/30 flex-wrap">
              {Object.entries(TYPE_COLOURS).map(([key, c]) => (
                <span key={key} className="flex items-center gap-1.5 capitalize">
                  <span className={`w-2 h-2 rounded-sm ${c.dot}`} />
                  {key.replace('_', ' ')}
                </span>
              ))}
              <span className="text-white/15">·</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm border border-dashed border-white/40" />Pending</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm border border-white/40" />Confirmed</span>
            </div>
            {/* Zoom */}
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-1 py-1">
              <button
                onClick={() => setHourHeight(h => Math.max(28, h - 16))}
                className="w-6 h-6 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors text-[14px] leading-none"
              >−</button>
              <button
                onClick={() => setHourHeight(HOUR_HEIGHT)}
                className="px-2 text-[10px] text-white/30 hover:text-white/60 transition-colors tabular-nums"
              >{Math.round((hourHeight / HOUR_HEIGHT) * 100)}%</button>
              <button
                onClick={() => setHourHeight(h => Math.min(120, h + 16))}
                className="w-6 h-6 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors text-[14px] leading-none"
              >+</button>
            </div>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-white/[0.06]">
          <div />
          {days.map((day, i) => {
            const isToday = isSameDay(day, today)
            const dayPending = bookingsForDay(day).filter(b => b.status === 'pending').length
            return (
              <div key={i} className="py-3 text-center border-l border-white/[0.04]">
                <p className="text-[10px] text-white/30 uppercase tracking-wide">
                  {day.toLocaleDateString('en-AU', { weekday: 'short' })}
                </p>
                <p className={`text-[15px] font-medium mt-0.5 ${isToday ? 'text-swin-red-light' : 'text-white/70'}`}>
                  {day.getDate()}
                </p>
                {dayPending > 0 && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400/80 mt-0.5" />
                )}
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
              const dayBookings = bookingsForDay(day)

              return (
                <div key={di} className="relative border-l border-white/[0.04]">
                  {/* Hour rows */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      style={{ height: hourHeight }}
                      className="border-b border-white/[0.04]"
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

                    const colours = TYPE_COLOURS[b.booking_type] ?? { block: 'bg-white/10 border-white/20 text-white/60', dot: '' }
                    const isCancelled = b.status === 'cancelled'
                    const isPending = b.status === 'pending'
                    const isSelected = selected?.id === b.id

                    return (
                      <button
                        key={b.id}
                        style={{ top, height, left: 2, right: 2 }}
                        className={[
                          'absolute rounded border px-2 py-1 overflow-hidden text-left w-[calc(100%-4px)] transition-all',
                          colours.block,
                          isPending ? 'border-dashed opacity-70' : 'opacity-100',
                          isCancelled ? 'opacity-30 grayscale' : '',
                          isSelected ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-black' : 'hover:brightness-125',
                        ].join(' ')}
                        onClick={() => setSelected(b.id === selected?.id ? null : b)}
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
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <BookingDetailPanel
          booking={selected}
          onClose={() => setSelected(null)}
          onAction={async () => { await loadBookings() }}
        />
      )}
    </div>
  )
}

function BookingDetailPanel({
  booking: b,
  onClose,
  onAction,
}: {
  booking: Booking
  onClose: () => void
  onAction: () => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()
  const [actionDone, setActionDone] = useState<'approved' | 'declined' | null>(null)

  const colours = TYPE_COLOURS[b.booking_type]
  const start = new Date(b.start_time)
  const end = new Date(b.end_time)
  const durationMs = end.getTime() - start.getTime()
  const durationHours = durationMs / 3_600_000

  function handle(action: () => Promise<void>, label: 'approved' | 'declined') {
    startTransition(async () => {
      await action()
      await onAction()
      setActionDone(label)
    })
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-[#0a0a0a] border-l border-white/[0.07] flex flex-col z-40 shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.06]">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${colours?.dot ?? 'bg-white/30'}`} />
            <span className="text-[11px] text-white/30 capitalize">{b.booking_type.replace('_', ' ')}</span>
          </div>
          <h2 className="text-[16px] font-medium text-white leading-snug">{b.title}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white transition-colors flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Status */}
        <div className="flex items-center gap-2">
          <StatusPill status={b.status} />
          {actionDone && (
            <span className="text-[12px] text-white/30">{actionDone === 'approved' ? 'Booking confirmed.' : 'Booking declined.'}</span>
          )}
        </div>

        {/* Date/time */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 space-y-1">
          <p className="text-[13px] text-white font-medium">
            {start.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-[12px] text-white/40">
            {start.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}
            {' – '}
            {end.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}
            {' · '}
            {durationHours % 1 === 0 ? `${durationHours}h` : `${durationHours}h`}
          </p>
        </div>

        {/* Requester */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Requested by</p>
          <p className="text-[13px] text-white">{b.users?.full_name ?? 'Unknown'}</p>
          {b.users?.email && <p className="text-[12px] text-white/35">{b.users.email}</p>}
        </div>

        {/* Attendees */}
        {b.attendee_count && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Expected attendees</p>
            <p className="text-[13px] text-white">{b.attendee_count} people</p>
          </div>
        )}

        {/* Notes */}
        {b.description && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Notes</p>
            <p className="text-[13px] text-white/60 leading-relaxed">{b.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-5 border-t border-white/[0.06] space-y-2">
        {b.status === 'pending' && (
          <>
            <button
              disabled={isPending}
              onClick={() => handle(() => approveBookingById(b.id), 'approved')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Approve booking'}
            </button>
            <button
              disabled={isPending}
              onClick={() => handle(() => rejectBookingById(b.id), 'declined')}
              className="w-full py-2.5 bg-white/[0.05] hover:bg-red-500/15 text-white/50 hover:text-red-400 text-[13px] font-medium rounded-lg transition-colors border border-white/[0.07] disabled:opacity-50"
            >
              Decline
            </button>
          </>
        )}
        {b.status === 'confirmed' && (
          <button
            disabled={isPending}
            onClick={() => handle(() => rejectBookingById(b.id), 'declined')}
            className="w-full py-2.5 bg-white/[0.05] hover:bg-red-500/15 text-white/50 hover:text-red-400 text-[13px] font-medium rounded-lg transition-colors border border-white/[0.07] disabled:opacity-50"
          >
            {isPending ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
        {b.status === 'cancelled' && (
          <p className="text-center text-[12px] text-white/20 py-1">This booking has been cancelled.</p>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:   'bg-amber-500/10 text-amber-400',
    confirmed: 'bg-emerald-500/10 text-emerald-400',
    cancelled: 'bg-red-500/10 text-red-400',
    completed: 'bg-white/8 text-white/40',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${styles[status] ?? 'bg-white/8 text-white/40'}`}>
      {status}
    </span>
  )
}
