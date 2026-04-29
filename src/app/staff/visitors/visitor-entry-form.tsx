'use client'

import { useActionState, useState } from 'react'
import { createVisitorEntry } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { VisitorCategory } from '@/types'

type State = { error?: string; success?: string } | null

interface Props {
  categories: Pick<VisitorCategory, 'id' | 'label'>[]
  totalsByCategoryId: Record<string, number>
}

export function VisitorEntryForm({ categories, totalsByCategoryId }: Props) {
  const [state, formAction, pending] = useActionState(
    createVisitorEntry as (s: State, fd: FormData) => Promise<State>,
    null
  )
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [count, setCount] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const currentTotal = totalsByCategoryId[categoryId] ?? 0
  const parsedCount = Number.parseInt(count, 10)
  const showSoftWarning = Number.isFinite(parsedCount) && parsedCount > 1000

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (showSoftWarning) {
      const label = categories.find((c) => c.id === categoryId)?.label ?? 'this category'
      const ok = window.confirm(
        `Adding ${parsedCount.toLocaleString()} to ${label}. That's a big jump — confirm?`
      )
      if (!ok) e.preventDefault()
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category_id" className="text-[12px] text-white/50 uppercase tracking-wide">
            Category
          </Label>
          <select
            id="category_id"
            name="category_id"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-white/10 bg-white/5 text-white text-[14px] px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-swin-red [color-scheme:dark]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-zinc-900">
                {c.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-white/35">
            Current total: <span className="text-white/70">{currentTotal.toLocaleString()}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="count" className="text-[12px] text-white/50 uppercase tracking-wide">
            Count
          </Label>
          <Input
            id="count"
            name="count"
            type="number"
            min="0"
            max="10000"
            required
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="e.g. 32"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red"
          />
          {showSoftWarning && (
            <p className="text-[11px] text-amber-300/80">
              Heads up: that&apos;s more than 1,000 — you&apos;ll be asked to confirm.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entry_date" className="text-[12px] text-white/50 uppercase tracking-wide">
            Date
          </Label>
          <Input
            id="entry_date"
            name="entry_date"
            type="date"
            defaultValue={today}
            className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red [color-scheme:dark]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note" className="text-[12px] text-white/50 uppercase tracking-wide">
            Note <span className="normal-case text-white/20">(optional)</span>
          </Label>
          <Input
            id="note"
            name="note"
            type="text"
            placeholder="e.g. Open Day morning session"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red"
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">{state.success}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="bg-swin-red hover:bg-swin-red-hover text-white"
      >
        {pending ? 'Saving…' : 'Add entry'}
      </Button>
    </form>
  )
}
