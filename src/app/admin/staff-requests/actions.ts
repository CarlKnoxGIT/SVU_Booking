'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'
import { revalidatePath } from 'next/cache'

export async function approveStaffRequest(requestId: string) {
  const supabase = createAdminClient()
  const authClient = await createClient()

  // Get the request
  const { data: req } = await supabase
    .from('staff_requests')
    .select('id, full_name, email')
    .eq('id', requestId)
    .single()

  if (!req) return { error: 'Request not found.' }

  // Get current admin user for reviewed_by
  const { data: { user: adminUser } } = await authClient.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', adminUser?.id)
    .single()

  // Pre-create the user record with staff role so ensureUserRecord links it on first login
  await supabase
    .from('users')
    .upsert(
      { email: req.email, full_name: req.full_name, role: 'staff' },
      { onConflict: 'email', ignoreDuplicates: false }
    )

  // Send Supabase invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(req.email, {
    data: { full_name: req.full_name },
    redirectTo: `${appUrl}/auth/callback?next=/auth/set-password`,
  })

  if (inviteError) {
    console.error('[staff-request] invite error:', inviteError)
    return { error: `Failed to send invite: ${inviteError.message}` }
  }

  // Mark request as approved
  await supabase
    .from('staff_requests')
    .update({ status: 'approved', reviewed_by: adminProfile?.id, updated_at: new Date().toISOString() })
    .eq('id', requestId)

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectStaffRequest(requestId: string) {
  const supabase = createAdminClient()

  const { data: req } = await supabase
    .from('staff_requests')
    .select('full_name, email')
    .eq('id', requestId)
    .single()

  if (!req) return { error: 'Request not found.' }

  await supabase
    .from('staff_requests')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', requestId)

  // Notify the applicant
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: req.email,
    replyTo: 'cknox@swin.edu.au',
    subject: 'SVU Booking — access request update',
    text: `Hi ${req.full_name},\n\nUnfortunately your request for staff access to the SVU Booking system was not approved at this time.\n\nIf you think this is a mistake, reply to this email.`,
    tags: [{ name: 'type', value: 'staff-request-rejected' }],
    html: `
      <p style="font-family:sans-serif;color:#fff;background:#000;padding:32px;">
        Hi ${req.full_name},<br/><br/>
        Unfortunately your request for staff access to the SVU Booking system was not approved at this time.<br/><br/>
        If you think this is a mistake, reply to this email.
      </p>`,
  }).catch(() => {})

  revalidatePath('/admin')
  return { success: true }
}
