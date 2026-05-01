'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEventNotifyWelcome } from '@/lib/email/send-event-notify-welcome'
import { sendEventNotifyAdminNotification } from '@/lib/email/send-event-notify-admin-notification'

type State = { error?: string; success?: boolean } | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitEventNotifySignup(_prevState: State, formData: FormData): Promise<State> {
  const honeypot = (formData.get('website') as string | null) ?? ''
  if (honeypot.trim().length > 0) {
    return { success: true }
  }

  const name = ((formData.get('name') as string | null) ?? '').trim()
  const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()

  if (!name || name.length > 200) {
    return { error: 'Please enter your name.' }
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  const supabase = await createClient()
  const source = 'events_page'

  const { error } = await supabase
    .from('event_notify_subscribers')
    .upsert(
      { name, email, source, unsubscribed_at: null, updated_at: new Date().toISOString() },
      { onConflict: 'email' }
    )

  if (error) {
    console.error('Event notify signup insert error:', error)
    return { error: 'Something went wrong. Please try again.' }
  }

  await Promise.all([
    sendEventNotifyWelcome({ to: email, name }),
    sendEventNotifyAdminNotification({ name, email, source }),
  ])

  return { success: true }
}
