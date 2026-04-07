import { createClient } from '@/lib/supabase/server'
import { BookingCalendar } from './book/calendar'

export default async function StaffDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('auth_id', user!.id)
    .single()

  return (
    <div className="h-full">
      <BookingCalendar currentUserId={profile?.id ?? ''} />
    </div>
  )
}
