'use client'

import { useActionState } from 'react'
import { submitEnquiry } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type State = { error?: string; success?: boolean } | null

export function EnquiryForm() {
  const [state, formAction, pending] = useActionState(
    submitEnquiry as (state: State, formData: FormData) => Promise<State>,
    null
  )

  if (state?.success) {
    return (
      <div className="border border-white/[0.07] bg-white/[0.02] p-10 text-center">
        <div className="mb-4 text-4xl">✓</div>
        <h2 className="text-xl font-light text-white mb-2">Enquiry received</h2>
        <p className="text-[13px] text-white/40 leading-relaxed">
          Thanks for reaching out. A member of our team will be in touch within 2 business days.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[12px] text-white/50 uppercase tracking-wide">
            Name
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
          <Label htmlFor="email" className="text-[12px] text-white/50 uppercase tracking-wide">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="jane@company.com"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organisation" className="text-[12px] text-white/50 uppercase tracking-wide">
          Organisation
        </Label>
        <Input
          id="organisation"
          name="organisation"
          type="text"
          placeholder="Company or institution name"
          className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="event_type" className="text-[12px] text-white/50 uppercase tracking-wide">
            Event type
          </Label>
          <select
            id="event_type"
            name="event_type"
            required
            className="w-full border border-white/10 bg-white/5 text-white text-[14px] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-swin-red [&>option]:bg-zinc-900"
          >
            <option value="">Select…</option>
            <option value="corporate">Corporate event</option>
            <option value="product_launch">Product launch</option>
            <option value="conference">Conference / summit</option>
            <option value="school">School group</option>
            <option value="private">Private experience</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="guest_count" className="text-[12px] text-white/50 uppercase tracking-wide">
            Estimated guests
          </Label>
          <Input
            id="guest_count"
            name="guest_count"
            type="number"
            min="1"
            max="60"
            placeholder="e.g. 40"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferred_date" className="text-[12px] text-white/50 uppercase tracking-wide">
          Preferred date(s)
        </Label>
        <Input
          id="preferred_date"
          name="preferred_date"
          type="text"
          placeholder="e.g. mid-June, flexible"
          className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-[12px] text-white/50 uppercase tracking-wide">
          Message
        </Label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us about your event, any specific requirements, or questions…"
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
        {pending ? 'Sending…' : 'Send enquiry'}
      </Button>
    </form>
  )
}
