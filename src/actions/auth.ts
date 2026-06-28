'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function cleanStr(s: string): string {
  // Drop any char > U+00FF (BOM, zero-width, etc.) then trim whitespace
  return s.split('').filter(c => c.charCodeAt(0) <= 255).join('').trim()
}

export async function signUp(email: string, password: string) {
  const e = cleanStr(email)
  const p = cleanStr(password)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: e,
    password: p,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }

  // Return whether session was created (auto-confirm) or email confirmation needed.
  // Cookies are set via Set-Cookie headers; client handles navigation.
  return { error: null, confirmed: !!data.session }
}

export async function signIn(email: string, password: string) {
  const e = cleanStr(email)
  const p = cleanStr(password)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email: e, password: p })

  if (error) return { error: error.message }

  // Return success — cookies are set via Set-Cookie response headers.
  // Client handles the navigation so the browser picks up the new cookies.
  return { error: null }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function sendResetEmail(email: string) {
  const e = cleanStr(email)
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(e, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  if (error) return { error: error.message }
  return { error: null, message: 'Password reset link sent. Check your email.' }
}

export async function updatePassword(password: string) {
  const p = cleanStr(password)
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password: p })

  if (error) return { error: error.message }

  redirect('/app/dashboard')
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: sessions } = await supabase.from('chat_sessions').select('id').eq('user_id', user.id)
  if (sessions?.length) {
    await supabase.from('chat_messages').delete().in('session_id', sessions.map(s => s.id))
  }
  await supabase.from('chat_sessions').delete().eq('user_id', user.id)
  await supabase.from('logged_workouts').delete().eq('user_id', user.id)
  await supabase.from('ai_programs').delete().eq('user_id', user.id)
  await supabase.from('workouts').delete().eq('user_id', user.id)
  await supabase.from('workout_sessions').delete().eq('user_id', user.id)
  await supabase.from('body_weights').delete().eq('user_id', user.id)
  await supabase.from('session_notes').delete().eq('user_id', user.id)
  await supabase.from('daily_readiness').delete().eq('user_id', user.id)
  await supabase.from('ai_coaching_sessions').delete().eq('user_id', user.id)
  await supabase.from('user_onboarding').delete().eq('user_id', user.id)
  await supabase.from('user_fitness_profile').delete().eq('user_id', user.id)
  await supabase.from('workout_plans').delete().eq('user_id', user.id)

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    await admin.auth.admin.deleteUser(user.id)
  }

  await supabase.auth.signOut()
  redirect('/welcome')
}
