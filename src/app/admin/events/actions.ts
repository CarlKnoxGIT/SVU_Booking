'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function duplicateEvent(id: string) {
  const supabase = createAdminClient()

  const { data: evt } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!evt) throw new Error('Event not found')

  const { error } = await supabase.from('events').insert({
    title: `${evt.title} (copy)`,
    description: evt.description,
    event_date: evt.event_date,
    start_time: evt.start_time,
    end_time: evt.end_time,
    ticket_price: evt.ticket_price,
    max_capacity: evt.max_capacity,
    is_free: evt.is_free,
    is_published: false,
    humanitix_url: evt.humanitix_url,
    tickets_sold: 0,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/admin/events')
}
