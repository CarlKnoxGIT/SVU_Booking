import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditEventForm } from './edit-event-form'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, description, event_date, start_time, end_time, ticket_price, max_capacity, humanitix_url, is_published')
    .eq('id', id)
    .single()

  if (!event) notFound()

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Edit event</h1>
        <p className="mt-1 text-sm text-white/35 truncate">{event.title}</p>
      </div>
      <EditEventForm event={event} />
    </div>
  )
}
