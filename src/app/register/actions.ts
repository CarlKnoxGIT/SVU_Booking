'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'

export async function submitStaffRequest(_prev: unknown, formData: FormData) {
  const full_name = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const message = (formData.get('message') as string)?.trim()

  if (!full_name || !email) return { error: 'Name and email are required.' }

  const isSwin = email.endsWith('@swin.edu.au') || email.endsWith('@swinburne.edu.au')
  if (!isSwin) return { error: 'Please use your Swinburne email address (@swin.edu.au or @swinburne.edu.au).' }

  const supabase = createAdminClient()

  // Check for duplicate
  const { data: existing } = await supabase
    .from('staff_requests')
    .select('id, status')
    .eq('email', email)
    .single()

  if (existing) {
    if (existing.status === 'approved') return { error: 'This email is already registered. Please sign in.' }
    return { error: 'A request for this email is already pending review.' }
  }

  const { error } = await supabase
    .from('staff_requests')
    .insert({ full_name, email, message: message || null })

  if (error) return { error: 'Failed to submit request. Please try again.' }

  // Notify admin
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: 'cknox@swin.edu.au',
    subject: `Staff access request — ${full_name}`,
    html: `
      <p style="font-family:sans-serif;color:#fff;background:#000;padding:32px;">
        <strong>${full_name}</strong> (${email}) has requested staff access to the SVU Booking system.<br/><br/>
        ${message ? `<em>${message}</em><br/><br/>` : ''}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/staff-requests" style="color:#e8002d;">
          Review in Admin →
        </a>
      </p>`,
  }).catch(() => {})

  return { success: true }
}
