import { auth } from '@clerk/nextjs/server'
import { supabase } from './supabase'

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  return user
}

export async function getCurrentTenant() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.tenant_id)
    .single()

  return tenant
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export async function getSupabaseClient() {
  return supabase
}