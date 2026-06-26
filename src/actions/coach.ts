'use server'

import { createClient } from '@/lib/supabase/server'
import { DailyReadiness, UserFitnessProfile, WorkoutSession } from '@/types'

export async function saveUserProfile(profile: Omit<UserFitnessProfile, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_fitness_profile')
    .upsert({ ...profile, user_id: user.id, updated_at: new Date().toISOString() })

  return { error: error?.message ?? null }
}

export async function getUserProfile(): Promise<UserFitnessProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_fitness_profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data as UserFitnessProfile | null
}

export async function getTodayReadiness(): Promise<DailyReadiness | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('daily_readiness')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return data as DailyReadiness | null
}

export async function saveReadiness(readiness: DailyReadiness) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', id: null }

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_readiness')
    .upsert({ ...readiness, user_id: user.id, date: today })
    .select('id')
    .single()

  return { error: error?.message ?? null, id: data?.id ?? null }
}

export async function getTodayCoachDecision() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('ai_coaching_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return data
}

export async function saveWorkoutSession(session: WorkoutSession) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const today = new Date().toISOString().split('T')[0]

  // Insert session
  const { data: sessionData, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      date: today,
      session_type: session.session_type,
      duration_minutes: session.duration_minutes ?? null,
      overall_rpe: session.overall_rpe ?? null,
      notes: session.notes ?? null,
    })
    .select('id')
    .single()

  if (sessionError || !sessionData) return { error: sessionError?.message ?? 'Failed to save session' }

  // Insert exercises + sets + feedback
  for (const exercise of session.exercises) {
    const { data: exData, error: exError } = await supabase
      .from('workout_exercises')
      .insert({
        workout_session_id: sessionData.id,
        exercise_id: exercise.exercise_id,
        exercise_name: exercise.exercise_name,
        sort_order: exercise.sort_order,
        target_muscles: exercise.target_muscles,
      })
      .select('id')
      .single()

    if (exError || !exData) continue

    if (exercise.sets.length > 0) {
      await supabase.from('exercise_sets').insert(
        exercise.sets.map(s => ({
          workout_exercise_id: exData.id,
          set_number: s.set_number,
          weight_kg: s.weight_kg,
          reps: s.reps,
          rpe: s.rpe,
          notes: s.notes ?? null,
        }))
      )
    }

    if (exercise.feedback) {
      await supabase.from('exercise_feedback').insert({
        workout_exercise_id: exData.id,
        technique_confidence: exercise.feedback.technique_confidence,
        difficulty: exercise.feedback.difficulty,
        weight_feel: exercise.feedback.weight_feel,
        soreness_prediction: exercise.feedback.soreness_prediction ?? null,
      })
    }
  }

  return { error: null }
}
