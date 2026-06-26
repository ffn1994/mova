import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runCoachBrain } from '@/lib/coach-brain'
import { DailyReadiness, UserFitnessProfile } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  const { readiness, readinessId }: { readiness: DailyReadiness; readinessId: string } = await request.json()

  // Get user's fitness profile
  const { data: profile } = await supabase
    .from('user_fitness_profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return Response.json({ error: 'No fitness profile found. Please set up your profile first.' }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Check if we already have a decision for today (avoid redundant AI calls)
  const { data: existing } = await supabase
    .from('ai_coaching_sessions')
    .select('decision')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (existing) {
    return Response.json({ decision: existing.decision })
  }

  try {
    const decision = await runCoachBrain(supabase, user.id, profile as UserFitnessProfile, readiness)

    // Persist the decision
    await supabase.from('ai_coaching_sessions').upsert({
      user_id: user.id,
      date: today,
      readiness_id: readinessId,
      decision,
    })

    return Response.json({ decision })
  } catch (err) {
    console.error('Coach brain error:', err)
    return Response.json({ error: String(err) }, { status: 502 })
  }
}
