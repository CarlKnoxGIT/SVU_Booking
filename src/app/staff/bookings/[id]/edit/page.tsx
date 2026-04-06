import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditBookingForm } from './edit-booking-form'

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .eq('user_id', profile?.id)
    .eq('status', 'pending')
    .single()

  if (!booking) redirect('/staff')

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">Edit booking</h1>
        <p className="mt-1 text-sm text-zinc-500">Only pending bookings can be edited.</p>
      </div>
      <EditBookingForm booking={booking} />
    </div>
  )
}
