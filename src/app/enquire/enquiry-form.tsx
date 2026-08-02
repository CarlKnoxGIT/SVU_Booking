'use client'

import { useActionState, useEffect, useRef } from 'react'
import { SplitButton } from '@/components/public-site/split-control'
import { submitEnquiry } from './actions'

type State = { error?: string; success?: boolean } | null

export function EnquiryForm() {
  const successRef = useRef<HTMLDivElement>(null)
  const [state, formAction, pending] = useActionState(
    submitEnquiry as (state: State, formData: FormData) => Promise<State>,
    null
  )

  useEffect(() => {
    if (state?.success) successRef.current?.focus()
  }, [state?.success])

  if (state?.success) {
    return (
      <div ref={successRef} className="form-success" role="status" tabIndex={-1}>
        <span aria-hidden="true">✓</span>
        <h2>Enquiry received</h2>
        <p>Thanks for reaching out. A member of our team will be in touch within two business days.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="mock-form">
      <div className="form-field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" type="text" autoComplete="name" placeholder="Jane Smith" required />
      </div>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="jane@example.com" required />
      </div>
      <div className="form-field form-field--wide">
        <label htmlFor="organisation">Organisation <span className="field-optional">(optional)</span></label>
        <input
          id="organisation"
          name="organisation"
          type="text"
          autoComplete="organization"
          placeholder="Organisation name"
        />
      </div>
      <div className="form-field">
        <label htmlFor="event_type">Event type</label>
        <select id="event_type" name="event_type" required defaultValue="">
          <option value="" disabled>Select…</option>
          <option value="corporate">Corporate event</option>
          <option value="product_launch">Product launch</option>
          <option value="conference">Conference / summit</option>
          <option value="school">School group</option>
          <option value="private">Private experience</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="guest_count">Estimated guests <span className="field-optional">(optional)</span></label>
        <input id="guest_count" name="guest_count" type="number" inputMode="numeric" min="1" max="60" placeholder="40" />
      </div>
      <div className="form-field form-field--wide">
        <label htmlFor="preferred_date">Preferred date(s) <span className="field-optional">(optional)</span></label>
        <input id="preferred_date" name="preferred_date" type="text" placeholder="Mid-June, flexible" />
      </div>
      <div className="form-field form-field--wide">
        <label htmlFor="message">Message <span className="field-optional">(optional)</span></label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us about your event, requirements, access needs, or questions."
        />
      </div>

      {state?.error && (
        <p className="form-error form-field--wide" role="alert">{state.error}</p>
      )}

      <div className="mock-form__footer form-field--wide">
        <p>Your information will be sent securely to the SVU team.</p>
        <SplitButton
          type="submit"
          label={pending ? 'Sending…' : 'Send enquiry'}
          disabled={pending}
        />
      </div>
    </form>
  )
}
