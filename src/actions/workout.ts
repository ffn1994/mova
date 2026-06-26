'use server'

import { createClient } from '@/lib/supabase/server'
import { WorkoutFormInputs } from '@/types'
import { revalidatePath } from 'next/cache'

export async function saveWorkout(
  content: string,
  title: string,
  inputs: WorkoutFormInputs
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('workout_plans').insert({
    user_id: user.id,
    title,
    content,
    inputs,
  })

  if (error) return { error: error.message }

  revalidatePath('/app/workout')
  return { error: null }
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('workout_plans').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/app/workout')
  return { error: null }
}
