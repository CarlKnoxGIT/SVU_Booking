'use server'

import { createClient } from '@/lib/supabase/server'

type State = { error?: string; success?: boolean } | null

export async function submitEnquiry(_prevState: State, formData: FormData): Promise<State> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const organisation = formData.get('organisation') as string
  const event_type = formData.get('event_type') as string
  const guest_count = formData.get('guest_count') as string
  const preferred_date = formData.get('preferred_date') as string
  const message = formData.get('message') as string

  if (!name || !email || !event_type) {
    return { error: 'Please fill in all required fields.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('enquiries').insert({
    name,
    email,
    organisation: organisation || null,
    event_type,
    guest_count: guest_count ? parseInt(guest_count) : null,
    preferred_date: preferred_date || null,
    message: message || null,
    status: 'new',
  })

  if (error) {
    console.error('Enquiry insert error:', error)
    return { error: 'Something went wrong. Please try again or email us directly.' }
  }

  return { success: true }
}
