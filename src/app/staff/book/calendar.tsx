'use client'

import { useState, useEffect, useActionState, useCallback, useTransition, useRef } from 'react'
import { getWeekBookings, createBookingRequest } from './actions'
import { cancelBooking, cancelSeries } from '../actions'
import Link from 'next/link'
import { TimeSelect } from '@/components/ui/time-select'

const HOUR_HEIGHT = 64
const START_HOUR = 6
const END_HOUR = 24
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

const BOOKING_TYPES = [
  { value: 'academic', label: 'Academic / Teaching' },
  { value: 'school', label: 'School Group' },
  { value: 'public_event', label: 'Public Event' },
  { value: 'external_hire', label: 'External Hire' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'vip', label: 'VIP' },
  { value: 'svu_demo', label: 'SVU Demo' },
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
  description: string | null
  attendee_count: number | null
  series_id: string | null
  users: { full_name: string | null } | null
  source?: 'booking' | 'event'
}

function fracToTimeStr(frac: number): string {
  const totalMins = Math.round(frac * 60)
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
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

export function BookingCalendar({ currentUserId }: { currentUserId: string }) {
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startHour: number; endHour: number } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const hourHeight = Math.round(HOUR_HEIGHT * 0.44)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [dragInfo, setDragInfo] = useState<{ day: Date; startFrac: number; currentFrac: number } | null>(null)

  // Day/week view toggle
  const [viewMode, setViewMode] = useState<'week' | '3day' | 'day'>('week')
  const [dayIndex, setDayIndex] = useState(0)
  const touchStartRef = useRef<{ day: Date; frac: number } | null>(null)

  // Auto-switch to 3-day view on narrow screens
  useEffect(() => {
    function checkMobile() {
      if (window.innerWidth < 768) {
        setViewMode('3day')
        const dow = new Date().getDay()
        setDayIndex(Math.min(dow === 0 ? 6 : dow - 1, 4))
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  function yToFrac(y: number): number {
    const raw = START_HOUR + Math.max(0, y) / hourHeight
    return Math.min(Math.max(Math.round(raw * 4) / 4, START_HOUR), END_HOUR)
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const visibleDays = viewMode === 'week' ? days : viewMode === '3day' ? days.slice(dayIndex, dayIndex + 3) : [days[dayIndex]]
  const gridColsClass = viewMode === 'week' ? 'grid-cols-[48px_repeat(7,1fr)]' : viewMode === '3day' ? 'grid-cols-[40px_repeat(3,1fr)]' : 'grid-cols-[48px_1fr]'

  const todayMon = getMondayOf(new Date())
  const isCurrentWeekActual = weekStart.getTime() === todayMon.getTime()
  const isOnToday = viewMode === 'week'
    ? isCurrentWeekActual
    : viewMode === '3day'
    ? isCurrentWeekActual && days.slice(dayIndex, dayIndex + 3).some(d => isSameDay(d, new Date()))
    : isSameDay(days[dayIndex], new Date())

  const loadBookings = useCallback(async () => {
    const data = await getWeekBookings(weekStart.toISOString())
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
  function prevPeriod() {
    if (viewMode === 'week') { prevWeek(); return }
    if (viewMode === '3day') {
      if (dayIndex > 0) { setDayIndex(d => d - 1) }
      else { setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n }); setDayIndex(4) }
      return
    }
    if (dayIndex > 0) { setDayIndex(d => d - 1) }
    else { setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n }); setDayIndex(6) }
  }
  function nextPeriod() {
    if (viewMode === 'week') { nextWeek(); return }
    if (viewMode === '3day') {
      if (dayIndex < 4) { setDayIndex(d => d + 1) }
      else { setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n }); setDayIndex(0) }
      return
    }
    if (dayIndex < 6) { setDayIndex(d => d + 1) }
    else { setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n }); setDayIndex(0) }
  }
  function goToday() {
    const t = new Date()
    const monday = getMondayOf(t)
    monday.setHours(0, 0, 0, 0)
    setWeekStart(monday)
    if (viewMode === 'day' || viewMode === '3day') {
      const dow = t.getDay()
      const idx = dow === 0 ? 6 : dow - 1
      setDayIndex(viewMode === '3day' ? Math.min(idx, 4) : idx)
    }
  }
  function handleViewToggle() {
    if (viewMode === 'week') {
      const todayMonday = getMondayOf(new Date())
      if (weekStart.getTime() === todayMonday.getTime()) {
        const dow = new Date().getDay()
        const idx = dow === 0 ? 6 : dow - 1
        setDayIndex(Math.min(idx, 4))
      } else {
        setDayIndex(0)
      }
      setViewMode('3day')
    } else if (viewMode === '3day') {
      setViewMode('day')
    } else {
      setViewMode('week')
    }
  }

  useEffect(() => {
    function onMouseUp() {
      if (!dragInfo) return
      const startFrac = Math.min(dragInfo.startFrac, dragInfo.currentFrac)
      const endFrac = Math.max(dragInfo.startFrac, dragInfo.currentFrac)
      const finalEnd = Math.min(endFrac - startFrac < 0.25 ? startFrac + 1 : endFrac, END_HOUR)
      setDragInfo(null)
      setSelectedSlot({ date: formatDate(dragInfo.day), startHour: startFrac, endHour: finalEnd })
      setPanelOpen(true)
    }
    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [dragInfo])

  function bookingForDay(day: Date) {
    return bookings.filter(b => isSameDay(new Date(b.start_time), day))
  }

  const today = new Date()

  return (
    <div className="flex h-full">
      {/* Calendar */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${panelOpen || selectedBooking ? 'md:mr-96' : ''}`}>

        {/* Toolbar */}
        <div className="flex items-center justify-between pl-14 pr-3 md:px-6 py-3 md:py-4 border-b border-white/[0.06] flex-wrap gap-y-1 gap-x-2 md:gap-3">
          <div className="hidden md:flex items-center gap-1 md:gap-2">
            <button onClick={prevPeriod} className="p-1.5 rounded hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={nextPeriod} className="p-1.5 rounded hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="text-[13px] md:text-[14px] font-medium text-white ml-1">
              {viewMode === 'week' ? (
                <>
                  {weekStart.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  <span className="hidden sm:inline">
                    {' — '}{days[6].toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </span>
                </>
              ) : viewMode === '3day' ? (
                <>
                  {days[dayIndex].toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  {' — '}
                  {days[Math.min(dayIndex + 2, 6)].toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </>
              ) : (
                days[dayIndex].toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3">
            {!isOnToday && (
              <button onClick={goToday} className="text-[12px] text-white/40 hover:text-white transition-colors">
                Today
              </button>
            )}
            {/* Legend — desktop only */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-white/30 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-400/70" />Academic</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-violet-400/70" />School</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-orange-400/70" />Public event</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-teal-400/70" />External hire</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-zinc-400/70" />Maintenance</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-400/70" />SVU Demo</span>
              <span className="text-white/15">·</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm border border-dashed border-white/40" />Pending</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm border border-white/40" />Confirmed</span>
            </div>
            {/* Day / Week toggle */}
            <button
              onClick={handleViewToggle}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white px-2 md:px-3 py-1.5 text-[12px] font-medium transition-colors"
            >
              {viewMode === 'week' ? '3 Day' : viewMode === '3day' ? 'Day' : 'Week'}
            </button>
          </div>
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className={`grid ${gridColsClass}`}>
            {/* Day headers — sticky inside scroll container so columns share the same scrollbar-affected width */}
            <div className={`sticky top-0 z-10 bg-black col-span-full grid ${gridColsClass} border-b border-white/[0.06]`}>
              <div /> {/* time gutter */}
              {visibleDays.map((day, i) => {
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
            {/* Time labels */}
            <div>
              {HOURS.map(h => (
                <div key={h} style={{ height: hourHeight }} className="flex items-start justify-end pr-2 pt-1">
                  <span className="text-[10px] text-white/20">{h === 24 ? '00:00' : `${h}:00`}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {visibleDays.map((day, di) => {
              const dayBookings = bookingForDay(day)
              const isPast = day < today && !isSameDay(day, today)

              return (
                <div
                  key={di}
                  className={`relative border-l border-white/[0.04] select-none ${!isPast ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
                  onMouseDown={e => {
                    if (isPast || (e.target as HTMLElement).closest('[data-booking-block]')) return
                    e.preventDefault()
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0)
                    const frac = yToFrac(y)
                    setDragInfo({ day, startFrac: frac, currentFrac: frac })
                  }}
                  onMouseMove={e => {
                    if (!dragInfo || !isSameDay(dragInfo.day, day)) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0)
                    setDragInfo(prev => prev ? { ...prev, currentFrac: yToFrac(y) } : null)
                  }}
                  onTouchStart={e => {
                    if (isPast || (e.target as HTMLElement).closest('[data-booking-block]')) return
                    const touch = e.touches[0]
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = touch.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0)
                    touchStartRef.current = { day, frac: yToFrac(y) }
                  }}
                  onTouchEnd={e => {
                    if (!touchStartRef.current || !isSameDay(touchStartRef.current.day, day)) return
                    const touch = e.changedTouches[0]
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = touch.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0)
                    const endFrac = yToFrac(y)
                    const startFrac = touchStartRef.current.frac
                    const finalEnd = Math.min(endFrac - startFrac < 0.25 ? startFrac + 1 : Math.max(startFrac, endFrac), END_HOUR)
                    touchStartRef.current = null
                    setSelectedSlot({ date: formatDate(day), startHour: startFrac, endHour: finalEnd })
                    setPanelOpen(true)
                  }}
                >
                  {/* Hour rows */}
                  {HOURS.map(h => (
                    <div key={h} style={{ height: hourHeight }} className="border-b border-white/[0.04]" />
                  ))}

                  {/* Drag selection highlight */}
                  {dragInfo && isSameDay(dragInfo.day, day) && (
                    <div
                      className="absolute inset-x-0 bg-swin-red/15 border border-swin-red/30 rounded pointer-events-none"
                      style={{
                        top: (Math.min(dragInfo.startFrac, dragInfo.currentFrac) - START_HOUR) * hourHeight,
                        height: Math.max(Math.abs(dragInfo.currentFrac - dragInfo.startFrac) * hourHeight, 2),
                      }}
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

                    const STACK_OFFSET = 12
                    const stackShift = col * STACK_OFFSET
                    const top = baseTop + stackShift
                    const height = Math.max(baseHeight - stackShift, 20)

                    let opacity = totalCols > 1 ? 1 / totalCols : 1
                    if (b.status === 'pending') opacity *= 0.7

                    const typeColours: Record<string, string> = {
                      academic:      'bg-blue-500/25 border-blue-400/50 text-blue-200',
                      school:        'bg-violet-500/25 border-violet-400/50 text-violet-200',
                      public_event:  'bg-orange-500/25 border-orange-400/50 text-orange-200',
                      external_hire: 'bg-teal-500/25 border-teal-400/50 text-teal-200',
                      maintenance:   'bg-zinc-500/25 border-zinc-400/50 text-zinc-300',
                      recurring:     'bg-pink-500/25 border-pink-400/50 text-pink-200',
                      vip:           'bg-yellow-500/25 border-yellow-400/50 text-yellow-200',
                      svu_demo:      'bg-swin-red/20 border-swin-red/40 text-swin-red-lighter',
                    }
                    const base = typeColours[b.booking_type] ?? 'bg-white/10 border-white/20 text-white/60'
                    const pending = b.status === 'pending' ? 'border-dashed' : ''

                    return (
                      <div
                        key={b.id}
                        style={{ top, height, left: 2, right: 2, zIndex: col + 1, opacity }}
                        data-booking-block="1"
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); if (b.source !== 'event') { setSelectedBooking(b); setPanelOpen(false); setSelectedSlot(null) } }}
                        className={`absolute rounded border px-2 py-1 overflow-hidden ${b.source === 'event' ? 'cursor-default' : 'cursor-pointer hover:brightness-125'} transition-all ${base} ${pending}`}
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

        {/* Mobile date navigation — sits above the bottom nav bar */}
        <div className="md:hidden flex items-center justify-between bg-black border-t border-white/[0.06] px-2 h-12 flex-shrink-0">
          <button onClick={prevPeriod} className="p-3 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[13px] font-medium text-white/70">
            {viewMode === 'week' ? (
              <>{weekStart.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} — {days[6].toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</>
            ) : viewMode === '3day' ? (
              <>{days[dayIndex].toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} — {days[Math.min(dayIndex + 2, 6)].toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</>
            ) : (
              days[dayIndex].toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' })
            )}
          </span>
          <button onClick={nextPeriod} className="p-3 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {(panelOpen || selectedBooking) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setPanelOpen(false); setSelectedSlot(null); setSelectedBooking(null) }}
        />
      )}

      {/* New booking panel */}
      {panelOpen && selectedSlot && (
        <BookingPanel
          slot={selectedSlot}
          onClose={() => { setPanelOpen(false); setSelectedSlot(null) }}
          onSuccess={() => { setPanelOpen(false); setSelectedSlot(null); loadBookings() }}
        />
      )}

      {/* Booking detail panel */}
      {selectedBooking && (
        <BookingDetailPanel
          booking={selectedBooking}
          isOwn={selectedBooking.user_id === currentUserId}
          onClose={() => setSelectedBooking(null)}
          onAction={() => { setSelectedBooking(null); loadBookings() }}
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
  slot: { date: string; startHour: number; endHour: number }
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

  const draggedMins = Math.round((slot.endHour - slot.startHour) * 60)
  const matchedDuration = DURATION_OPTIONS.find(d => d.value === String(draggedMins))
  const [duration, setDuration] = useState(matchedDuration ? matchedDuration.value : draggedMins > 0 ? 'custom' : '60')

  const defaultStartTime = fracToTimeStr(slot.startHour)
  const defaultEndTime = fracToTimeStr(slot.endHour)
  const isAllDay = duration === 'allday'
  const isCustom = duration === 'custom'

  return (
    <div className="fixed bottom-0 left-0 right-0 max-h-[90vh] md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-96 bg-[#0a0a0a] border-t md:border-t-0 md:border-l border-white/[0.07] flex flex-col z-40 shadow-2xl rounded-t-2xl md:rounded-t-none overflow-hidden">
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
              {isAllDay
                ? <input type="hidden" name="start_time" value="08:00" />
                : <TimeSelect name="start_time" defaultValue={defaultStartTime} required />
              }
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
              <TimeSelect name="end_time" defaultValue={defaultEndTime} required />
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

const TYPE_LABELS: Record<string, string> = {
  academic: 'Academic / Teaching',
  school: 'School Group',
  public_event: 'Public Event',
  external_hire: 'External Hire',
  maintenance: 'Maintenance',
  vip: 'VIP',
}

const TYPE_COLOURS: Record<string, string> = {
  academic:      'bg-blue-500/25 border-blue-400/50 text-blue-200',
  school:        'bg-violet-500/25 border-violet-400/50 text-violet-200',
  public_event:  'bg-orange-500/25 border-orange-400/50 text-orange-200',
  external_hire: 'bg-teal-500/25 border-teal-400/50 text-teal-200',
  maintenance:   'bg-zinc-500/25 border-zinc-400/50 text-zinc-300',
  vip:           'bg-yellow-500/25 border-yellow-400/50 text-yellow-200',
}

const STATUS_COLOURS: Record<string, string> = {
  pending:   'bg-amber-500/10 text-amber-400',
  confirmed: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
  completed: 'bg-white/[0.06] text-white/30',
}

function BookingDetailPanel({
  booking: b,
  isOwn,
  onClose,
  onAction,
}: {
  booking: Booking
  isOwn: boolean
  onClose: () => void
  onAction: () => void
}) {
  const [cancelPending, startCancelTransition] = useTransition()
  const [seriesPending, startSeriesTransition] = useTransition()

  const start = new Date(b.start_time)
  const end = new Date(b.end_time)
  const durationMins = (end.getTime() - start.getTime()) / 60_000
  const durationLabel = durationMins >= 60
    ? `${durationMins / 60}h`
    : `${durationMins}min`

  function handleCancel() {
    if (!confirm('Cancel this booking?')) return
    startCancelTransition(async () => {
      await cancelBooking(b.id)
      onAction()
    })
  }

  function handleCancelSeries() {
    if (!confirm('Cancel all upcoming sessions in this recurring series?')) return
    startSeriesTransition(async () => {
      await cancelSeries(b.series_id!)
      onAction()
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 max-h-[90vh] md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-96 bg-[#0a0a0a] border-t md:border-t-0 md:border-l border-white/[0.07] flex flex-col z-40 shadow-2xl rounded-t-2xl md:rounded-t-none overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.06]">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[11px] text-white/30 capitalize mb-1">
            {TYPE_LABELS[b.booking_type] ?? b.booking_type}
          </p>
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
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ${STATUS_COLOURS[b.status] ?? 'bg-white/[0.06] text-white/30'}`}>
            {b.status}
          </span>
          {b.series_id && (
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium bg-pink-500/10 text-pink-400">
              Recurring
            </span>
          )}
        </div>

        {/* Date & time */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Date & Time</p>
          <p className="text-[14px] text-white">
            {start.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <p className="text-[13px] text-white/50">
            {start.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}
            {' – '}
            {end.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}
            {' · '}
            {durationLabel}
          </p>
        </div>

        {/* Booked by */}
        {b.users?.full_name && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Booked by</p>
            <p className="text-[13px] text-white/70">{b.users.full_name}</p>
          </div>
        )}

        {/* Attendees */}
        {b.attendee_count && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Attendees</p>
            <p className="text-[13px] text-white/70">{b.attendee_count}</p>
          </div>
        )}

        {/* Notes */}
        {b.description && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase">Notes</p>
            <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap">{b.description}</p>
          </div>
        )}

        {/* Actions — own bookings only */}
        {isOwn && (b.status === 'pending' || b.status === 'confirmed') && (
          <div className="pt-2 border-t border-white/[0.06] space-y-3">
            {b.status === 'pending' && (
              <Link
                href={`/staff/bookings/${b.id}/edit`}
                className="block w-full text-center rounded-lg border border-white/10 bg-white/[0.04] py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/[0.07] transition-colors"
              >
                Edit booking
              </Link>
            )}
            <button
              onClick={handleCancel}
              disabled={cancelPending}
              className="w-full rounded-lg border border-red-500/20 bg-red-500/5 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
            >
              {cancelPending ? 'Cancelling…' : 'Cancel this session'}
            </button>
            {b.series_id && (
              <button
                onClick={handleCancelSeries}
                disabled={seriesPending}
                className="w-full rounded-lg border border-white/10 py-2.5 text-[13px] text-white/30 hover:text-red-400 hover:border-red-500/20 transition-colors disabled:opacity-40"
              >
                {seriesPending ? 'Cancelling…' : 'Cancel entire series'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
