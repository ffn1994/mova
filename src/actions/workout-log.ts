'use server'

import { createClient } from '@/lib/supabase/server'

export async function getRecentWorkouts(limit = 5) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('logged_workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function saveLoggedWorkout(workout: {
  workout_name: string
  program_id?: string | null
  started_at: string
  finished_at: string
  duration_minutes: number
  total_volume_kg: number
  estimated_calories: number
  performance_rating?: number
  muscles_trained: string[]
  exercises: unknown[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('logged_workouts')
    .insert({ ...workout, user_id: user.id })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: data.id }
}

export async function getAllWorkouts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('logged_workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}
