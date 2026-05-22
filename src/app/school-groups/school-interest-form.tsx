'use client'

import { useActionState } from 'react'
import { submitSchoolInterest } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type State = { error?: string; success?: boolean } | null

export function SchoolInterestForm() {
  const [state, formAction, pending] = useActionState(
    submitSchoolInterest as (state: State, formData: FormData) => Promise<State>,
    null
  )

  if (state?.success) {
    return (
      <div className="border border-white/[0.07] bg-white/[0.02] p-10 text-center">
        <div className="mb-4 text-4xl">✓</div>
        <h2 className="text-xl font-light text-white mb-2">You're on the list</h2>
        <p className="text-[15px] text-white leading-relaxed">
          Thanks for registering your interest. We'll be in touch when school sessions open.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[13px] text-white/85 uppercase tracking-wide">
            Your name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Jane Smith"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] text-white/85 uppercase tracking-wide">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="jane@school.vic.edu.au"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="school" className="text-[13px] text-white/85 uppercase tracking-wide">
          School name
        </Label>
        <Input
          id="school"
          name="school"
          type="text"
          required
          placeholder="e.g. Riverside Primary School"
          className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="year_level" className="text-[13px] text-white/85 uppercase tracking-wide">
            Year level(s)
          </Label>
          <select
            id="year_level"
            name="year_level"
            className="w-full border border-white/10 bg-white/5 text-white text-[14px] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-swin-red [&>option]:bg-zinc-900"
          >
            <option value="">Select…</option>
            <option value="Primary (Years 3–6)">Primary (Years 3–6)</option>
            <option value="Lower Secondary (Years 7–9)">Lower Secondary (Years 7–9)</option>
            <option value="Senior / VCE (Years 10–12)">Senior / VCE (Years 10–12)</option>
            <option value="Mixed year levels">Mixed year levels</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="student_count" className="text-[13px] text-white/85 uppercase tracking-wide">
            Approx. number of students
          </Label>
          <Input
            id="student_count"
            name="student_count"
            type="number"
            min="1"
            max="200"
            placeholder="e.g. 30"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-[13px] text-white/85 uppercase tracking-wide">
          Anything else <span className="text-white/40 normal-case tracking-normal">(optional)</span>
        </Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Any questions, curriculum requirements, or context that might help us…"
          className="w-full border border-white/10 bg-white/5 text-white text-[14px] px-3 py-2 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-swin-red resize-none"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-swin-red hover:bg-swin-red-hover text-white rounded-none py-3"
      >
        {pending ? 'Sending…' : 'Register interest'}
      </Button>
    </form>
  )
}
