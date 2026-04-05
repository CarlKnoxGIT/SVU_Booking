'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type State = { error?: string } | null

export async function createEvent(_prevState: State, formData: FormData): Promise<State> {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const event_date = formData.get('event_date') as string
  const start_time = formData.get('start_time') as string
  const end_time = formData.get('end_time') as string
  const ticket_price = parseFloat(formData.get('ticket_price') as string) || 0
  const max_capacity = parseInt(formData.get('max_capacity') as string) || 60
  const is_published = formData.getAll('is_published').includes('true')
  const humanitix_url = (formData.get('humanitix_url') as string) || null
  const is_free = ticket_price === 0

  if (!title || !event_date || !start_time || !end_time) {
    return { error: 'Title, date, start time and end time are required.' }
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title,
      description: description || null,
      event_date,
      start_time,
      end_time,
      ticket_price,
      max_capacity,
      is_free,
      is_published,
      humanitix_url,
      tickets_sold: 0,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Create event error:', error)
    return { error: 'Failed to create event. Please try again.' }
  }

  redirect(`/admin/events`)
}
