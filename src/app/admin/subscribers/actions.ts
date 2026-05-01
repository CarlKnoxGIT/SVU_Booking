'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteSubscriber(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('event_notify_subscribers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete subscriber error:', error)
    throw new Error('Failed to delete subscriber')
  }

  revalidatePath('/admin')
}
