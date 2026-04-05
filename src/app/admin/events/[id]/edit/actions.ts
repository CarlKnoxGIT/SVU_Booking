'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type State = { error?: string } | null

export async function updateEvent(_prevState: State, formData: FormData): Promise<State> {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const event_date = formData.get('event_date') as string
  const start_time = formData.get('start_time') as string
  const end_time = formData.get('end_time') as string
  const ticket_price = parseFloat(formData.get('ticket_price') as string) || 0
  const max_capacity = parseInt(formData.get('max_capacity') as string) || 60
  const humanitix_url = (formData.get('humanitix_url') as string) || null
  const is_published = formData.getAll('is_published').includes('true')
  const is_free = ticket_price === 0

  if (!title || !event_date || !start_time || !end_time) {
    return { error: 'Title, date, start time and end time are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('events')
    .update({ title, description: description || null, event_date, start_time, end_time, ticket_price, max_capacity, humanitix_url, is_published, is_free, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Update event error:', error)
    return { error: 'Failed to save changes.' }
  }

  redirect('/admin/events')
}

export async function deleteEvent(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('events').delete().eq('id', id)
  redirect('/admin/events')
}
