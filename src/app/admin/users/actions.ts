'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'

export async function inviteStaff(email: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://svu3d.ai'
  const registerUrl = `${siteUrl}${base}/staff/register`

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    replyTo: 'cknox@swin.edu.au',
    subject: 'You\'re invited to the SVU Booking System',
    html: `
      <div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;max-width:560px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.3);text-transform:uppercase;">SVU Booking</p>
        <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;">You've been invited.</h2>
        <p style="font-size:14px;color:rgba(255,255,255,0.7);margin-bottom:24px;">
          You've been invited to access the SVU Booking System at Swinburne's Virtual Universe.
          Click the link below to create your account.
        </p>
        <a href="${registerUrl}" style="display:inline-block;background:#e8002d;color:#fff;padding:12px 24px;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">
          Create your account →
        </a>
        <p style="margin-top:24px;font-size:12px;color:rgba(255,255,255,0.3);">
          If the button doesn't work, copy this link: ${registerUrl}
        </p>
      </div>`,
  })

  if (error) throw new Error(error.message)
}

export async function updateUserRole(formData: FormData) {
  const id = formData.get('id') as string
  const role = formData.get('role') as string
  const supabase = createAdminClient()
  await supabase.from('users').update({ role }).eq('id', id)
  revalidatePath('/admin')
}

export async function deleteUser(id: string) {
  const supabase = createAdminClient()

  // Get the auth_id so we can delete the auth user too
  const { data: profile, error: fetchErr } = await supabase
    .from('users')
    .select('auth_id')
    .eq('id', id)
    .single()

  if (fetchErr) console.error('[deleteUser] fetch profile error:', fetchErr)

  // Delete dependent records first
  await supabase.from('tickets').delete().eq('user_id', id)
  await supabase.from('payments').delete().eq('user_id', id)
  await supabase.from('bookings').delete().eq('user_id', id)

  // Delete from public users table
  const { error: deleteErr } = await supabase.from('users').delete().eq('id', id)
  if (deleteErr) console.error('[deleteUser] delete from users error:', deleteErr)

  // Delete from Supabase auth (requires service role)
  if (profile?.auth_id) {
    const { error: authErr } = await supabase.auth.admin.deleteUser(profile.auth_id)
    if (authErr) console.error('[deleteUser] auth delete error:', authErr)
  } else {
    console.log('[deleteUser] no auth_id found for user:', id)
  }

  revalidatePath('/admin')
}
