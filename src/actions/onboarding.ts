'use server'

import { createClient } from '@/lib/supabase/server'
import { OnboardingData } from '@/context/OnboardingContext'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

function buildPrompt(d: OnboardingData): string {
  const goal = d.fitness_goal.replace(/_/g, ' ')
  const exp = d.has_trained_before
    ? `${d.years_experience} years experience, ${d.is_currently_active ? 'currently active' : d.recently_stopped ? 'recently stopped' : 'inactive for a while'}`
    : 'complete beginner'
  const unit = d.unit_preference

  return `You are an expert strength and conditioning coach. Analyze this athlete profile and create their personalized training program.

ATHLETE PROFILE:
- Name: ${d.first_name}, Age: ${d.age}, Gender: ${d.gender}
- Height: ${d.height_cm}${unit === 'kg' ? 'cm' : 'in'}, Weight: ${d.weight_kg}${unit}
- Goal: ${goal}
- Experience: ${exp}
- Training location: ${d.training_location}
- Schedule: ${d.training_days_per_week} days/week, ${d.workout_duration_minutes} min/session
- Lifestyle: ${d.job_type} job, sleeps ${d.avg_sleep_hours}h, stress: ${d.stress_level}
- Injuries/Limitations: ${d.has_injuries ? d.injury_details : 'none'}, Medical: ${d.has_medical_conditions ? d.medical_details : 'none'}
- Avoid: ${d.exercises_to_avoid || 'nothing specific'}

Respond with ONLY valid JSON in this exact format:
{
  "fitness_level": "beginner|intermediate|advanced",
  "training_system": "Full Body|Upper Lower|Push Pull Legs|Body Part Split|Athletic",
  "weekly_schedule": [
    {
      "day_name": "Monday",
      "focus": "Upper Body Push",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "target_muscles": ["chest", "triceps", "shoulders"],
          "notes": ""
        }
      ]
    }
  ],
  "cardio_recommendation": "Brief cardio guidance",
  "estimated_weeks_to_goal": 12,
  "recommendation_reason": "2-3 sentences explaining why this program fits this athlete",
  "timeline_summary": "What they can expect to achieve in 12 weeks"
}`
}

export async function saveOnboardingAndGenerateProgram(
  data: OnboardingData
): Promise<{ error?: string; programId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Save onboarding data
  const { error: saveError } = await supabase
    .from('user_onboarding')
    .upsert({
      user_id: user.id,
      first_name: data.first_name,
      age: parseInt(data.age) || null,
      gender: data.gender,
      height_cm: parseFloat(data.height_cm) || null,
      weight_kg: parseFloat(data.weight_kg) || null,
      country: data.country,
      unit_preference: data.unit_preference,
      fitness_goal: data.fitness_goal,
      has_trained_before: data.has_trained_before,
      years_experience: parseFloat(data.years_experience) || 0,
      is_currently_active: data.is_currently_active,
      recently_stopped: data.recently_stopped,
      training_location: data.training_location,
      training_days_per_week: data.training_days_per_week,
      workout_duration_minutes: data.workout_duration_minutes,
      preferred_workout_time: data.preferred_workout_time,
      job_type: data.job_type,
      daily_activity_level: data.daily_activity_level,
      avg_sleep_hours: data.avg_sleep_hours,
      stress_level: data.stress_level,
      avg_daily_steps: parseInt(data.avg_daily_steps) || 5000,
      has_injuries: data.has_injuries,
      injury_details: data.injury_details,
      has_medical_conditions: data.has_medical_conditions,
      medical_details: data.medical_details,
      has_pain: data.has_pain,
      pain_details: data.pain_details,
      exercises_to_avoid: data.exercises_to_avoid,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (saveError) return { error: saveError.message }

  // Generate AI program
  if (!OPENROUTER_API_KEY) return { error: 'OpenRouter API key not configured' }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Mova AI Fitness',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4-6',
        messages: [{ role: 'user', content: buildPrompt(data) }],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { error: `AI error: ${err}` }
    }

    const json = await response.json()
    const content = json.choices?.[0]?.message?.content ?? ''

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { error: 'AI returned invalid response' }

    const program = JSON.parse(jsonMatch[0])

    // Deactivate old programs
    await supabase.from('ai_programs').update({ is_active: false }).eq('user_id', user.id)

    // Save new program
    const { data: newProgram, error: programError } = await supabase
      .from('ai_programs')
      .insert({
        user_id: user.id,
        training_system: program.training_system,
        fitness_level: program.fitness_level,
        goal: data.fitness_goal,
        weekly_schedule: program.weekly_schedule,
        recommendation_reason: program.recommendation_reason,
        estimated_weeks_to_goal: program.estimated_weeks_to_goal,
        cardio_recommendation: program.cardio_recommendation,
        is_active: true,
      })
      .select('id')
      .single()

    if (programError) return { error: programError.message }

    // Also update fitness_level in onboarding
    await supabase
      .from('user_onboarding')
      .update({ fitness_level: program.fitness_level })
      .eq('user_id', user.id)

    return { programId: newProgram.id }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function getActiveProgram() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('ai_programs')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data
}

export async function getOnboardingData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}
