'use client'

import { useActionState, useEffect, useRef } from 'react'
import { submitEventNotifySignup } from './actions'
import { SplitButton } from '@/components/public-site/split-control'

type State = { error?: string; success?: boolean } | null

export function NotifyMeCard() {
  const successRef = useRef<HTMLElement>(null)
  const [state, formAction, pending] = useActionState(
    submitEventNotifySignup as (state: State, formData: FormData) => Promise<State>,
    null
  )

  useEffect(() => {
    if (state?.success) successRef.current?.focus()
  }, [state?.success])

  if (state?.success) {
    return (
      <section
        ref={successRef}
        className="enquiry-section event-notify event-notify--success"
        role="status"
        tabIndex={-1}
        data-reveal-block
      >
        <div className="enquiry-section__intro">
          <p className="eyebrow">Event updates</p>
          <h2>You&rsquo;re on the list.</h2>
        </div>
        <div className="event-notify__confirmation">
          <p>
            We&rsquo;ll email you when new SVU events are announced.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="enquiry-section event-notify" aria-labelledby="event-notify-title" data-reveal-block>
      <div className="enquiry-section__intro">
        <p className="eyebrow">Coming next</p>
        <h2 id="event-notify-title">More sessions coming soon.</h2>
        <p>
          Be the first to know. Drop your name and email and we&rsquo;ll let you know the moment SVU events go live — one email, no spam, ever.
        </p>
      </div>

      <form action={formAction} className="mock-form notify-form">
        <div className="form-field">
          <label htmlFor="notify_name">Name</label>
          <input
            id="notify_name"
            name="name"
            type="text"
            required
            maxLength={200}
            autoComplete="name"
            placeholder="Jane Smith"
          />
        </div>
        <div className="form-field">
          <label htmlFor="notify_email">Email</label>
          <input
            id="notify_email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jane@example.com"
          />
        </div>

        <div
          className="form-honeypot"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
        >
          <label htmlFor="notify_website">Website (leave blank)</label>
          <input
            id="notify_website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {state?.error && (
          <p className="form-status is-visible form-field--wide" role="alert">{state.error}</p>
        )}

        <div className="mock-form__footer form-field--wide">
          <p>One email when new public events are announced. No ongoing newsletter.</p>
          <SplitButton
            type="submit"
            disabled={pending}
            label={pending ? 'Adding…' : 'Notify me'}
          />
        </div>
      </form>
    </section>
  )
}
