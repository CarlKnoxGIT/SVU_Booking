'use client'
import { useState } from 'react'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINS = ['00', '15', '30', '45']

function parse(t = '09:00'): [string, string] {
  const [h = '09', m = '00'] = t.split(':')
  const roundedM = Math.round(parseInt(m, 10) / 15) * 15
  return [h.padStart(2, '0'), String(roundedM % 60).padStart(2, '0')]
}

const SEL = 'bg-white/5 border border-white/10 px-2 py-2 text-[13px] text-white focus:outline-none focus:border-white/30 rounded'

/**
 * Replaces <input type="time"> with two selects (HH and MM) that always
 * display in 24-hour format regardless of OS locale.
 *
 * Uncontrolled (form submission):  <TimeSelect name="start_time" defaultValue="09:00" />
 * Controlled (state binding):      <TimeSelect value={t} onChange={setT} />
 */
export function TimeSelect({
  name,
  defaultValue,
  value,
  onChange,
  required,
}: {
  name?: string
  defaultValue?: string
  value?: string
  onChange?: (v: string) => void
  required?: boolean
}) {
  const [localH, setLocalH] = useState(() => parse(defaultValue)[0])
  const [localM, setLocalM] = useState(() => parse(defaultValue)[1])

  const controlled = value !== undefined
  const [h, m] = controlled ? parse(value) : [localH, localM]

  function update(newH: string, newM: string) {
    if (!controlled) { setLocalH(newH); setLocalM(newM) }
    onChange?.(`${newH}:${newM}`)
  }

  return (
    <div className="flex items-center gap-1">
      {name && <input type="hidden" name={name} value={`${h}:${m}`} required={required} />}
      <select value={h} onChange={e => update(e.target.value, m)} className={SEL}>
        {HOURS.map(v => <option key={v} value={v} className="bg-zinc-900">{v}</option>)}
      </select>
      <span className="text-white/30 select-none text-[13px] font-medium px-0.5">:</span>
      <select value={m} onChange={e => update(h, e.target.value)} className={SEL}>
        {MINS.map(v => <option key={v} value={v} className="bg-zinc-900">{v}</option>)}
      </select>
    </div>
  )
}
