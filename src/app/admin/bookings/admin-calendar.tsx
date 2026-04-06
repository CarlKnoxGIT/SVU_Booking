'use client'

import { useState, useEffect, useCallback, useTransition, useRef } from 'react'
import { getAdminWeekBookings, approveBookingById, rejectBookingById, adminUpdateBooking, adminUpdateAllByTitle, adminCreateBooking, bulkApproveBookings, bulkDeleteBookings, blockDates } from './actions'

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
  vip:           { block: 'bg-yellow-500/25 border-yellow-400/50 text-yellow-200', dot: 'bg-yellow-400/70' },
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

// Columnar overlap layout — returns col index and total cols for each booking
function layoutBookings<T extends { start_time: string; end_time: string }>(bookings: T[]) {
  const sorted = [...bookings].sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )
  const cols: T[][] = []
  const colMap = new Map<T, number>()

  for (const b of sorted) {
    const start = new Date(b.start_time).getTime()
    let placed = false
    for (let c = 0; c < cols.length; c++) {
      const last = cols[c][cols[c].length - 1]
      if (new Date(last.end_time).getTime() <= start) {
        cols[c].push(b)
        colMap.set(b, c)
        placed = true
        break
      }
    }
    if (!placed) { cols.push([b]); colMap.set(b, cols.length - 1) }
  }

  return sorted.map(b => {
    const col = colMap.get(b)!
    const bs = new Date(b.start_time).getTime()
    const be = new Date(b.end_time).getTime()
    const overlapping = sorted.filter(o => {
      const os = new Date(o.start_time).getTime()
      const oe = new Date(o.end_time).getTime()
      return os < be && oe > bs
    })
    const totalCols = Math.max(...overlapping.map(o => colMap.get(o)!)) + 1
    return { booking: b, col, totalCols }
  })
}

export function AdminBookingCalendar() {
  const [weekStart, setWeekStart] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selected, setSelected] = useState<Booking | null>(null)
  const [creating, setCreating] = useState(false)
  const hourHeight = Math.round(HOUR_HEIGHT * 0.44)
  const [loading, setLoading] = useState(false)

  // Drag state
  const dragRef = useRef<{ booking: Booking; offsetY: number } | null>(null)
  const [dropPreview, setDropPreview] = useState<{ dayIndex: number; top: number; height: number } | null>(null)
  const [, startDragTransition] = useTransition()

  // Bulk select state
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkPending, startBulkTransition] = useTransition()

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function exitSelectMode() { setSelectMode(false); setSelectedIds(new Set()) }

  // Undo state
  const [undoSnapshot, setUndoSnapshot] = useState<Booking | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showUndo(original: Booking) {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoSnapshot(original)
    undoTimerRef.current = setTimeout(() => setUndoSnapshot(null), 6000)
  }

  function handleUndo() {
    if (!undoSnapshot) return
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoSnapshot(null)
    startDragTransition(async () => {
      await adminUpdateBooking(undoSnapshot.id, {
        title: undoSnapshot.title,
        booking_type: undoSnapshot.booking_type,
        description: undoSnapshot.description,
        start_time: undoSnapshot.start_time,
        end_time: undoSnapshot.end_time,
        attendee_count: undoSnapshot.attendee_count,
        status: undoSnapshot.status,
      })
      await loadBookings()
    })
  }

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
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${selected || creating ? 'mr-[400px]' : ''}`}>

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
            <button
              onClick={() => { setSelectMode(s => !s); setSelectedIds(new Set()); setSelected(null) }}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${selectMode ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white'}`}
            >
              {selectMode ? `${selectedIds.size} selected` : 'Select'}
            </button>
            <button
              onClick={() => { setCreating(true); setSelected(null) }}
              className="flex items-center gap-1.5 rounded-lg bg-swin-red hover:bg-swin-red-hover px-3 py-1.5 text-[12px] font-medium text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New booking
            </button>
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
              const preview = dropPreview?.dayIndex === di ? dropPreview : null

              return (
                <div
                  key={di}
                  className="relative border-l border-white/[0.04]"
                  onDragOver={e => {
                    e.preventDefault()
                    const drag = dragRef.current
                    if (!drag) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const rawY = e.clientY - rect.top - drag.offsetY
                    // Snap to 15-min increments
                    const rawHour = START_HOUR + rawY / hourHeight
                    const snapped = Math.round(rawHour * 4) / 4
                    const clamped = Math.max(START_HOUR, Math.min(END_HOUR - 0.25, snapped))
                    const duration = (new Date(drag.booking.end_time).getTime() - new Date(drag.booking.start_time).getTime()) / 3_600_000
                    setDropPreview({
                      dayIndex: di,
                      top: (clamped - START_HOUR) * hourHeight,
                      height: Math.max(duration * hourHeight, 20),
                    })
                  }}
                  onDragLeave={() => setDropPreview(null)}
                  onDrop={e => {
                    e.preventDefault()
                    const drag = dragRef.current
                    if (!drag || !dropPreview || dropPreview.dayIndex !== di) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const rawY = e.clientY - rect.top - drag.offsetY
                    const rawHour = START_HOUR + rawY / hourHeight
                    const snappedHour = Math.round(rawHour * 4) / 4
                    const clampedHour = Math.max(START_HOUR, Math.min(END_HOUR - 0.25, snappedHour))
                    const durationMs = new Date(drag.booking.end_time).getTime() - new Date(drag.booking.start_time).getTime()
                    const newStart = new Date(day)
                    newStart.setHours(Math.floor(clampedHour), Math.round((clampedHour % 1) * 60), 0, 0)
                    const newEnd = new Date(newStart.getTime() + durationMs)
                    const original = { ...drag.booking }
                    setDropPreview(null)
                    dragRef.current = null
                    startDragTransition(async () => {
                      await adminUpdateBooking(drag.booking.id, {
                        title: drag.booking.title,
                        booking_type: drag.booking.booking_type,
                        description: drag.booking.description,
                        start_time: newStart.toISOString(),
                        end_time: newEnd.toISOString(),
                        attendee_count: drag.booking.attendee_count,
                        status: drag.booking.status,
                      })
                      await loadBookings()
                      showUndo(original)
                    })
                  }}
                >
                  {/* Hour rows */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      style={{ height: hourHeight }}
                      className="border-b border-white/[0.04]"
                    />
                  ))}

                  {/* Drop preview ghost */}
                  {preview && (
                    <div
                      style={{ top: preview.top, height: preview.height, left: 2, right: 2 }}
                      className="absolute rounded border-2 border-dashed border-white/40 bg-white/5 pointer-events-none"
                    />
                  )}

                  {/* Booking blocks — stacked with per-layer opacity */}
                  {layoutBookings(dayBookings).map(({ booking: b, col, totalCols }) => {
                    const start = new Date(b.start_time)
                    const end = new Date(b.end_time)
                    const startFrac = start.getHours() + start.getMinutes() / 60
                    const endFrac = end.getHours() + end.getMinutes() / 60
                    const baseTop = (startFrac - START_HOUR) * hourHeight
                    const baseHeight = Math.max((endFrac - startFrac) * hourHeight, 20)
                    const colours = TYPE_COLOURS[b.booking_type] ?? { block: 'bg-white/10 border-white/20 text-white/60', dot: '' }
                    const isCancelled = b.status === 'cancelled'
                    const isPending = b.status === 'pending'
                    const isSelected = selected?.id === b.id
                    const isDragging = dragRef.current?.booking.id === b.id
                    const isChecked = selectedIds.has(b.id)

                    // Stack: each layer cascades down so its title row is visible
                    const STACK_OFFSET = 12
                    const stackShift = col * STACK_OFFSET
                    const top = baseTop + stackShift
                    const height = Math.max(baseHeight - stackShift, 20)

                    // Opacity: 1/n per layer, then modifiers
                    let opacity = totalCols > 1 ? 1 / totalCols : 1
                    if (isPending) opacity *= 0.7
                    if (isCancelled) opacity *= 0.3
                    if (isDragging) opacity *= 0.4

                    return (
                      <div
                        key={b.id}
                        draggable={!selectMode}
                        style={{ top, height, left: 2, right: 2, zIndex: col, opacity }}
                        className={[
                          'absolute rounded border px-2 py-1 overflow-hidden text-left select-none',
                          selectMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing',
                          colours.block,
                          isPending ? 'border-dashed' : '',
                          isCancelled ? 'grayscale' : '',
                          isChecked ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-black brightness-125' : (isSelected ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-black' : 'hover:brightness-125'),
                        ].join(' ')}
                        onDragStart={e => {
                          if (selectMode) { e.preventDefault(); return }
                          const blockTop = e.currentTarget.getBoundingClientRect().top
                          dragRef.current = { booking: b, offsetY: e.clientY - blockTop }
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        onDragEnd={() => { dragRef.current = null; setDropPreview(null) }}
                        onClick={() => selectMode ? toggleSelect(b.id) : setSelected(b.id === selected?.id ? null : b)}
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

      {/* Detail panel */}
      {selected && !creating && (
        <BookingDetailPanel
          booking={selected}
          onClose={() => setSelected(null)}
          onAction={async () => { await loadBookings() }}
        />
      )}

      {/* Create panel */}
      {creating && (
        <NewBookingPanel
          defaultDate={weekStart}
          onClose={() => setCreating(false)}
          onCreated={async () => { await loadBookings(); setCreating(false) }}
        />
      )}

      {/* Bulk approve bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl px-5 py-3">
          <span className="text-[13px] text-white/60">{selectedIds.size} booking{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <button
            disabled={bulkPending}
            onClick={() => {
              const ids = Array.from(selectedIds)
              startBulkTransition(async () => {
                await bulkApproveBookings(ids)
                await loadBookings()
                exitSelectMode()
              })
            }}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
          >
            {bulkPending ? 'Working…' : 'Approve all'}
          </button>
          <button
            disabled={bulkPending}
            onClick={() => {
              if (!confirm(`Delete ${selectedIds.size} booking${selectedIds.size !== 1 ? 's' : ''}? This cannot be undone.`)) return
              const ids = Array.from(selectedIds)
              startBulkTransition(async () => {
                await bulkDeleteBookings(ids)
                await loadBookings()
                exitSelectMode()
              })
            }}
            className="px-4 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
          >
            Delete all
          </button>
          <button onClick={exitSelectMode} className="text-white/30 hover:text-white transition-colors text-[18px] leading-none">×</button>
        </div>
      )}

      {/* Undo toast */}
      {undoSnapshot && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl px-5 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="text-[13px] text-white/60">Booking rescheduled.</span>
          <button
            onClick={handleUndo}
            className="text-[13px] font-semibold text-swin-red-light hover:text-swin-red-lighter transition-colors"
          >
            Undo
          </button>
          <button
            onClick={() => { setUndoSnapshot(null); if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }}
            className="text-white/20 hover:text-white/50 transition-colors text-[18px] leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

const BOOKING_TYPES = ['academic', 'research', 'maintenance', 'school', 'public_event', 'external_hire', 'vip']
const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed']

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
  const [editing, setEditing] = useState(false)
  const [editAll, setEditAll] = useState(false)

  // Edit form state
  const start = new Date(b.start_time)
  const end = new Date(b.end_time)
  const [title, setTitle] = useState(b.title)
  const [bookingType, setBookingType] = useState(b.booking_type)
  const [description, setDescription] = useState(b.description ?? '')
  const [startDate, setStartDate] = useState(b.start_time.slice(0, 10))
  const [startTime, setStartTime] = useState(start.toTimeString().slice(0, 5))
  const [endTime, setEndTime] = useState(end.toTimeString().slice(0, 5))
  const [attendeeCount, setAttendeeCount] = useState(String(b.attendee_count ?? ''))
  const [status, setStatus] = useState(b.status)
  const [editError, setEditError] = useState<string | null>(null)

  // Sync state when booking prop changes
  useEffect(() => {
    setTitle(b.title)
    setBookingType(b.booking_type)
    setDescription(b.description ?? '')
    setStartDate(b.start_time.slice(0, 10))
    setStartTime(new Date(b.start_time).toTimeString().slice(0, 5))
    setEndTime(new Date(b.end_time).toTimeString().slice(0, 5))
    setAttendeeCount(String(b.attendee_count ?? ''))
    setStatus(b.status)
    setEditing(false)
    setEditError(null)
    setActionDone(null)
  }, [b.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const colours = TYPE_COLOURS[b.booking_type]
  const durationMs = end.getTime() - start.getTime()
  const durationHours = durationMs / 3_600_000

  function handle(action: () => Promise<void>, label: 'approved' | 'declined') {
    startTransition(async () => {
      await action()
      await onAction()
      setActionDone(label)
    })
  }

  function saveEdit() {
    const startAt = new Date(`${startDate}T${startTime}:00`)
    const endAt = new Date(`${startDate}T${endTime}:00`)
    if (endAt <= startAt) { setEditError('End time must be after start time.'); return }
    setEditError(null)
    startTransition(async () => {
      if (editAll) {
        await adminUpdateAllByTitle(b.title, {
          title,
          booking_type: bookingType,
          status,
          start_time_of_day: startTime,
          end_time_of_day: endTime,
        })
      } else {
        await adminUpdateBooking(b.id, {
          title,
          booking_type: bookingType,
          description: description || null,
          start_time: startAt.toISOString(),
          end_time: endAt.toISOString(),
          attendee_count: attendeeCount ? parseInt(attendeeCount) : null,
          status,
        })
      }
      await onAction()
      setEditing(false)
    })
  }

  const inputCls = 'w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-swin-red placeholder:text-white/20'
  const labelCls = 'text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase mb-1 block'

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
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => { setEditing(e => !e); setEditError(null) }}
            className={`p-1.5 rounded transition-colors text-[11px] ${editing ? 'text-swin-red-light' : 'text-white/30 hover:text-white'}`}
            title="Edit booking"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {!editing ? (
          <>
            <div className="flex items-center gap-2">
              <StatusPill status={b.status} />
              {actionDone && (
                <span className="text-[12px] text-white/30">{actionDone === 'approved' ? 'Booking confirmed.' : 'Booking declined.'}</span>
              )}
            </div>
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
            <div className="space-y-1">
              <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Requested by</p>
              <p className="text-[13px] text-white">{b.users?.full_name ?? 'Unknown'}</p>
              {b.users?.email && <p className="text-[12px] text-white/35">{b.users.email}</p>}
            </div>
            {b.attendee_count && (
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Expected attendees</p>
                <p className="text-[13px] text-white">{b.attendee_count} people</p>
              </div>
            )}
            {b.description && (
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Notes</p>
                <p className="text-[13px] text-white/60 leading-relaxed">{b.description}</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select value={bookingType} onChange={e => setBookingType(e.target.value)} className={inputCls}>
                {BOOKING_TYPES.map(t => (
                  <option key={t} value={t} className="bg-zinc-900 capitalize">{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
                {STATUSES.map(s => (
                  <option key={s} value={s} className="bg-zinc-900 capitalize">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Start time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} step="900" className={`${inputCls} [color-scheme:dark]`} />
              </div>
              <div>
                <label className={labelCls}>End time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} step="900" className={`${inputCls} [color-scheme:dark]`} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Attendees</label>
              <input type="number" value={attendeeCount} onChange={e => setAttendeeCount(e.target.value)} min="1" className={inputCls} placeholder="—" />
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Optional…" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={editAll}
                onChange={e => setEditAll(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-swin-red"
              />
              <span className="text-[12px] text-white/40">Apply to all bookings named "{b.title}"</span>
            </label>
            {editError && (
              <p className="text-[12px] text-red-400">{editError}</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-5 border-t border-white/[0.06] space-y-2">
        {editing ? (
          <>
            <button
              disabled={isPending}
              onClick={saveEdit}
              className="w-full py-2.5 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </button>
            <button
              onClick={() => { setEditing(false); setEditError(null) }}
              className="w-full py-2 text-[13px] text-white/30 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}


function NewBookingPanel({
  defaultDate,
  onClose,
  onCreated,
}: {
  defaultDate: Date
  onClose: () => void
  onCreated: () => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [multiDay, setMultiDay] = useState(false)

  const defaultDateStr = defaultDate.toISOString().split('T')[0]
  const inputCls = 'w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-swin-red placeholder:text-white/20 [color-scheme:dark]'
  const labelCls = 'text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase mb-1 block'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const startDate = fd.get('start_date') as string
    const endDate = (fd.get('end_date') as string) || startDate
    const startTime = fd.get('start_time') as string
    const endTime = fd.get('end_time') as string
    if (endTime <= startTime) { setError('End time must be after start time.'); return }
    if (endDate < startDate) { setError('End date must be on or after start date.'); return }
    setError(null)

    const title = fd.get('title') as string
    const booking_type = fd.get('booking_type') as string
    const description = (fd.get('description') as string) || null
    const attendee_count = fd.get('attendee_count') ? parseInt(fd.get('attendee_count') as string) : null
    const status = fd.get('status') as string

    startTransition(async () => {
      try {
        if (multiDay && endDate !== startDate) {
          // Use blockDates logic to create one booking per day
          await blockDates({ reason: title, start_date: startDate, end_date: endDate, start_time: startTime, end_time: endTime })
        } else {
          const startAt = new Date(`${startDate}T${startTime}:00`)
          const endAt = new Date(`${startDate}T${endTime}:00`)
          await adminCreateBooking({ title, booking_type, description, start_time: startAt.toISOString(), end_time: endAt.toISOString(), attendee_count, status })
        }
        await onCreated()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-[#0a0a0a] border-l border-white/[0.07] flex flex-col z-40 shadow-2xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <h2 className="text-[16px] font-medium text-white">New booking</h2>
        <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form id="new-booking-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div>
          <label className={labelCls}>Title</label>
          <input name="title" required placeholder="e.g. COS30049 Week 8 Lab" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select name="booking_type" defaultValue="academic" className={inputCls}>
            {BOOKING_TYPES.map(t => (
              <option key={t} value={t} className="bg-zinc-900 capitalize">{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select name="status" defaultValue="confirmed" className={inputCls}>
            {STATUSES.map(s => (
              <option key={s} value={s} className="bg-zinc-900 capitalize">{s}</option>
            ))}
          </select>
        </div>
        <div className={multiDay ? 'grid grid-cols-2 gap-3' : ''}>
          <div>
            <label className={labelCls}>{multiDay ? 'From date' : 'Date'}</label>
            <input type="date" name="start_date" required defaultValue={defaultDateStr} className={inputCls} />
          </div>
          {multiDay && (
            <div>
              <label className={labelCls}>To date</label>
              <input type="date" name="end_date" required defaultValue={defaultDateStr} className={inputCls} />
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={multiDay} onChange={e => setMultiDay(e.target.checked)} className="w-3.5 h-3.5 rounded accent-swin-red" />
          <span className="text-[12px] text-white/40">Spans multiple days</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start time</label>
            <input type="time" name="start_time" required defaultValue="09:00" step="900" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End time</label>
            <input type="time" name="end_time" required defaultValue="10:00" step="900" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Attendees</label>
          <input type="number" name="attendee_count" min="1" placeholder="—" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea name="description" rows={3} placeholder="Optional…" className={`${inputCls} resize-none`} />
        </div>
        {error && <p className="text-[12px] text-red-400">{error}</p>}
      </form>

      <div className="px-6 py-5 border-t border-white/[0.06]">
        <button
          type="submit"
          form="new-booking-form"
          disabled={isPending}
          className="w-full py-2.5 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? 'Creating…' : 'Create booking'}
        </button>
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
