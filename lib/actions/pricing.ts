'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { pricingTierSchema } from '@/lib/validations/meetings'

export async function createPricingTier(formData: {
  duration_minutes: number
  price: number
  label: string
  description?: string
  sort_order?: number
}) {
  const parsed = pricingTierSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase.from('pricing_tiers').insert({
    duration_minutes: parsed.data.duration_minutes,
    price: parsed.data.price,
    label: parsed.data.label,
    description: parsed.data.description || null,
    sort_order: parsed.data.sort_order ?? 0,
    is_active: true,
  })

  if (error) return { error: 'Failed to create pricing tier.' }

  revalidatePath('/admin/pricing')
  revalidatePath('/dashboard/book')
  return { success: true }
}

export async function updatePricingTier(
  id: string,
  formData: {
    duration_minutes: number
    price: number
    label: string
    description?: string
    sort_order?: number
  }
) {
  const parsed = pricingTierSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('pricing_tiers')
    .update({
      duration_minutes: parsed.data.duration_minutes,
      price: parsed.data.price,
      label: parsed.data.label,
      description: parsed.data.description || null,
      sort_order: parsed.data.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: 'Failed to update pricing tier.' }

  revalidatePath('/admin/pricing')
  revalidatePath('/dashboard/book')
  return { success: true }
}

export async function togglePricingTier(id: string, isActive: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('pricing_tiers')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'Failed to toggle pricing tier.' }

  revalidatePath('/admin/pricing')
  revalidatePath('/dashboard/book')
  return { success: true }
}

export async function deletePricingTier(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('pricing_tiers')
    .delete()
    .eq('id', id)

  if (error) return { error: 'Failed to delete pricing tier.' }

  revalidatePath('/admin/pricing')
  revalidatePath('/dashboard/book')
  return { success: true }
}
