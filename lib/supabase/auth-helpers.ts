import { createClient } from './server'
import type { Profile } from '@/lib/types/database'

export async function getCurrentUserProfile(): Promise<{
  user: { id: string; email: string }
  profile: Profile
} | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return { user: { id: user.id, email: user.email! }, profile }
}
