'use client'

import { useActionState, useState, useTransition } from 'react'
import { upsertCategory, toggleCategoryActive } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { VisitorCategory } from '@/types'

type State = { error?: string; success?: string } | null

interface Props {
  categories: VisitorCategory[]
}

export function ManageCategories({ categories }: Props) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(
    upsertCategory as (s: State, fd: FormData) => Promise<State>,
    null
  )
  const [, startToggle] = useTransition()

  const handleToggle = (id: string, next: boolean) => {
    startToggle(async () => {
      const res = await toggleCategoryActive(id, next)
      if (res?.error) window.alert(res.error)
    })
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[12px] font-medium uppercase tracking-wide text-white/50">
          Manage categories
        </span>
        <span className="text-[12px] text-white/30">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="mt-5 space-y-6">
          <div className="space-y-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div>
                  <p className="text-[13px] text-white">{c.label}</p>
                  <p className="text-[11px] text-white/30">
                    slug: {c.slug} · order: {c.sort_order}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-[11px] text-white/50">
                  <input
                    type="checkbox"
                    defaultChecked={c.is_active}
                    onChange={(e) => handleToggle(c.id, e.target.checked)}
                    className="accent-swin-red"
                  />
                  Active
                </label>
              </div>
            ))}
          </div>

          <form action={formAction} className="space-y-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-wide text-white/40">Add category</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cat-label" className="text-[11px] text-white/50">Label</Label>
                <Input
                  id="cat-label"
                  name="label"
                  required
                  placeholder="Conferences"
                  className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cat-slug" className="text-[11px] text-white/50">Slug</Label>
                <Input
                  id="cat-slug"
                  name="slug"
                  required
                  placeholder="conferences"
                  className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cat-sort" className="text-[11px] text-white/50">Sort order</Label>
                <Input
                  id="cat-sort"
                  name="sort_order"
                  type="number"
                  defaultValue={(categories.at(-1)?.sort_order ?? 0) + 10}
                  className="border-white/10 bg-white/5 text-white focus-visible:ring-swin-red"
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
              {pending ? 'Saving…' : 'Add category'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
