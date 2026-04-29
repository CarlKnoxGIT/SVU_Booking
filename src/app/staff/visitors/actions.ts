'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type State = { error?: string; success?: string } | null

const MAX_PER_ENTRY = 10000

async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, profile: null }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  return { supabase, profile }
}

export async function createVisitorEntry(
  _prev: State,
  formData: FormData
): Promise<State> {
  const { supabase, profile } = await getCurrentUser()
  if (!profile || !['staff', 'super_admin'].includes(profile.role)) {
    return { error: 'Not authorised.' }
  }

  const category_id = (formData.get('category_id') as string) || ''
  const countRaw = formData.get('count') as string
  const entry_date = (formData.get('entry_date') as string) || null
  const note = ((formData.get('note') as string) || '').trim() || null

  const count = Number.parseInt(countRaw, 10)
  if (!category_id) return { error: 'Choose a category.' }
  if (!Number.isFinite(count) || count < 0) return { error: 'Count must be a positive number.' }
  if (count > MAX_PER_ENTRY) return { error: `Single entry capped at ${MAX_PER_ENTRY.toLocaleString()}.` }

  const { error } = await supabase.from('visitor_entries').insert({
    category_id,
    count,
    entry_date: entry_date || new Date().toISOString().slice(0, 10),
    note,
    recorded_by: profile.id,
  })

  if (error) {
    console.error('createVisitorEntry error:', error)
    return { error: 'Failed to save entry.' }
  }

  revalidatePath('/')
  revalidatePath('/staff/visitors')
  return { success: `Added ${count.toLocaleString()}.` }
}

export async function deleteVisitorEntry(id: string): Promise<State> {
  const { supabase, profile } = await getCurrentUser()
  if (!profile || profile.role !== 'super_admin') return { error: 'Admin only.' }

  const { error } = await supabase.from('visitor_entries').delete().eq('id', id)
  if (error) {
    console.error('deleteVisitorEntry error:', error)
    return { error: 'Failed to delete.' }
  }

  revalidatePath('/')
  revalidatePath('/staff/visitors')
  return { success: 'Deleted.' }
}

export async function upsertCategory(
  _prev: State,
  formData: FormData
): Promise<State> {
  const { supabase, profile } = await getCurrentUser()
  if (!profile || profile.role !== 'super_admin') return { error: 'Admin only.' }

  const id = (formData.get('id') as string) || null
  const label = ((formData.get('label') as string) || '').trim()
  const slug = ((formData.get('slug') as string) || '').trim().toLowerCase().replace(/\s+/g, '_')
  const sort_order = Number.parseInt(formData.get('sort_order') as string, 10) || 0

  if (!label) return { error: 'Label required.' }
  if (!slug) return { error: 'Slug required.' }

  if (id) {
    const { error } = await supabase
      .from('visitor_categories')
      .update({ label, slug, sort_order })
      .eq('id', id)
    if (error) {
      console.error('upsertCategory update error:', error)
      return { error: 'Failed to update.' }
    }
  } else {
    const { error } = await supabase
      .from('visitor_categories')
      .insert({ label, slug, sort_order })
    if (error) {
      console.error('upsertCategory insert error:', error)
      return { error: error.code === '23505' ? 'Slug already exists.' : 'Failed to create.' }
    }
  }

  revalidatePath('/')
  revalidatePath('/staff/visitors')
  return { success: 'Saved.' }
}

export async function toggleCategoryActive(id: string, next: boolean): Promise<State> {
  const { supabase, profile } = await getCurrentUser()
  if (!profile || profile.role !== 'super_admin') return { error: 'Admin only.' }

  const { error } = await supabase
    .from('visitor_categories')
    .update({ is_active: next })
    .eq('id', id)

  if (error) {
    console.error('toggleCategoryActive error:', error)
    return { error: 'Failed to update.' }
  }

  revalidatePath('/')
  revalidatePath('/staff/visitors')
  return { success: 'Updated.' }
}
