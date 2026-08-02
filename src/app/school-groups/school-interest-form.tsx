'use client'

import { useActionState, useEffect, useRef } from 'react'
import { SplitButton } from '@/components/public-site/split-control'
import { submitSchoolInterest } from './actions'

type State = { error?: string; success?: boolean } | null

export function SchoolInterestForm() {
  const successRef = useRef<HTMLDivElement>(null)
  const [state, formAction, pending] = useActionState(
    submitSchoolInterest as (state: State, formData: FormData) => Promise<State>,
    null
  )

  useEffect(() => {
    if (state?.success) successRef.current?.focus()
  }, [state?.success])

  if (state?.success) {
    return (
      <div ref={successRef} className="form-status is-visible school-form-success" role="status" tabIndex={-1}>
        <div aria-hidden="true">✓</div>
        <h2>You&apos;re on the list</h2>
        <p>
          Thanks for registering your interest. We&apos;ll be in touch when school sessions open.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="mock-form">
      <div className="form-field">
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="jane@school.vic.edu.au"
          required
        />
      </div>

      <div className="form-field form-field--wide">
        <label htmlFor="school">School name</label>
        <input
          id="school"
          name="school"
          type="text"
          autoComplete="organization"
          placeholder="Riverside Primary School"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="year_level">
          Year level(s) <span className="field-optional">(optional)</span>
        </label>
        <select id="year_level" name="year_level">
          <option value="">Select…</option>
          <option value="Primary (Years 3–6)">Primary (Years 3–6)</option>
          <option value="Lower Secondary (Years 7–9)">Lower Secondary (Years 7–9)</option>
          <option value="Senior / VCE (Years 10–12)">Senior / VCE (Years 10–12)</option>
          <option value="Mixed year levels">Mixed year levels</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="student_count">
          Approx. number of students <span className="field-optional">(optional)</span>
        </label>
        <input
          id="student_count"
          name="student_count"
          type="number"
          inputMode="numeric"
          min="1"
          max="200"
          placeholder="30"
        />
      </div>

      <div className="form-field form-field--wide">
        <label htmlFor="notes">
          Anything else <span className="field-optional">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Any questions, curriculum requirements, or context that might help us…"
        />
      </div>

      {state?.error && (
        <p className="form-status is-visible form-field--wide" role="alert">
          {state.error}
        </p>
      )}

      <div className="mock-form__footer form-field--wide">
        <p>We&apos;ll use these details only to contact you about school visits.</p>
        <SplitButton
          type="submit"
          label={pending ? 'Sending…' : 'Register interest'}
          className="prototype-submit"
          disabled={pending}
        />
      </div>
    </form>
  )
}
