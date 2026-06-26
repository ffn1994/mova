import { SupabaseClient } from '@supabase/supabase-js'
import { CoachDecision, DailyReadiness, UserFitnessProfile } from '@/types'
import { EXERCISE_LIBRARY } from './exercise-library'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

// ─── Data gathering ───────────────────────────────────────────────────────────

interface ExerciseFeedbackRow {
  technique_confidence: number
  difficulty: number
  weight_feel: string
}

interface TrainingHistoryRow {
  date: string
  session_type: string
  overall_rpe: number | null
  workout_exercises: {
    exercise_name: string
    target_muscles: string[]
    exercise_sets: { weight_kg: number | null; reps: number | null; rpe: number | null }[]
    // Supabase returns one-to-many arrays even for unique relations
    exercise_feedback: ExerciseFeedbackRow[]
  }[]
}

interface MuscleRecoveryItem {
  muscle: string
  lastTrainedDaysAgo: number | null
  estimatedRecoveryPct: number
}

async function getTrainingHistory(supabase: SupabaseClient, userId: string): Promise<TrainingHistoryRow[]> {
  const since = new Date()
  since.setDate(since.getDate() - 14)

  const { data } = await supabase
    .from('workout_sessions')
    .select(`
      date, session_type, overall_rpe,
      workout_exercises (
        exercise_name, target_muscles,
        exercise_sets ( weight_kg, reps, rpe ),
        exercise_feedback ( technique_confidence, difficulty, weight_feel )
      )
    `)
    .eq('user_id', userId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(12)

  return (data ?? []) as TrainingHistoryRow[]
}

function computeMuscleRecovery(history: TrainingHistoryRow[]): MuscleRecoveryItem[] {
  const muscles = Array.from(new Set(EXERCISE_LIBRARY.flatMap(e => e.primary_muscles)))
  const today = new Date()

  return muscles.map(muscle => {
    // Find the most recent session that trained this muscle
    let lastTrainedDaysAgo: number | null = null
    let rpeAtLastSession: number | null = null

    for (const session of history) {
      const trained = session.workout_exercises.some(ex =>
        ex.target_muscles.includes(muscle)
      )
      if (trained) {
        const sessionDate = new Date(session.date)
        lastTrainedDaysAgo = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        rpeAtLastSession = session.overall_rpe
        break
      }
    }

    // Simple recovery curve: 0 days=10%, 1=35%, 2=60%, 3=78%, 4=90%, 5+=100%
    let base = 100
    if (lastTrainedDaysAgo !== null) {
      const curve = [10, 35, 60, 78, 90, 100]
      base = curve[Math.min(lastTrainedDaysAgo, 5)]
      // High RPE slows recovery
      if (rpeAtLastSession && rpeAtLastSession >= 8) base = Math.max(base - 15, 0)
    }

    return { muscle, lastTrainedDaysAgo, estimatedRecoveryPct: base }
  })
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function formatTrainingHistory(history: TrainingHistoryRow[]): string {
  if (history.length === 0) return 'No recent training history.'

  return history.map(session => {
    const dayLabel = formatDaysAgo(session.date)
    const exercises = session.workout_exercises.map(ex => {
      const setsSummary = ex.exercise_sets
        .map(s => `${s.weight_kg ?? 'BW'}kg×${s.reps ?? '?'}${s.rpe ? ` @RPE${s.rpe}` : ''}`)
        .join(', ')
      const fb = ex.exercise_feedback?.[0]
      const feedback = fb
        ? ` [feel: ${fb.weight_feel}, technique: ${fb.technique_confidence}/5]`
        : ''
      return `    - ${ex.exercise_name}: ${setsSummary}${feedback}`
    }).join('\n')

    return `${session.date} (${dayLabel}) — ${session.session_type}${session.overall_rpe ? ` [Session RPE: ${session.overall_rpe}/10]` : ''}\n${exercises}`
  }).join('\n\n')
}

function formatMuscleRecovery(recovery: MuscleRecoveryItem[]): string {
  return recovery.map(r => {
    const when = r.lastTrainedDaysAgo === null
      ? 'not trained recently (fully recovered)'
      : r.lastTrainedDaysAgo === 0
        ? 'trained today'
        : `trained ${r.lastTrainedDaysAgo} day(s) ago`
    return `  ${r.muscle}: ${when} — ~${r.estimatedRecoveryPct}% recovered`
  }).join('\n')
}

function formatDaysAgo(dateStr: string): string {
  const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

function buildCoachPrompt(
  profile: UserFitnessProfile,
  readiness: DailyReadiness,
  history: TrainingHistoryRow[],
  muscleRecovery: MuscleRecoveryItem[]
): string {
  const goalMap = {
    lose_weight: 'Lose weight and improve body composition',
    build_muscle: 'Build muscle and increase strength',
    improve_endurance: 'Improve cardiovascular endurance',
  }
  const equipmentMap = { none: 'Bodyweight only', dumbbells: 'Dumbbells at home', gym: 'Full gym access' }
  const workFatigue = ['None (sedentary job)', 'Light (office with some walking)', 'Moderate (on feet most of day)', 'Heavy (manual labor)']

  return `You are an elite AI fitness coach. Make a precise, data-driven training decision for today based on the following user data.

USER FITNESS PROFILE:
- Goal: ${goalMap[profile.goal]}
- Fitness Level: ${profile.fitness_level}
- Training Days Per Week: ${profile.days_per_week}
- Equipment: ${equipmentMap[profile.equipment]}

TODAY'S READINESS DATA:
- Sleep: ${readiness.sleep_hours} hours, quality ${readiness.sleep_quality}/5
- Energy Level: ${readiness.energy_level}/5
- Physical Work Fatigue: ${workFatigue[readiness.physical_work_fatigue]}
- Stress Level: ${readiness.stress_level}/5 (5 = extremely stressed)
- Hydration: ${readiness.hydration}/5
- Yesterday's Nutrition: ${readiness.nutrition_yesterday}/5
- Perceived Fatigue: ${readiness.user_fatigue}/5 (5 = completely exhausted)
${readiness.notes ? `- User Notes: "${readiness.notes}"` : ''}

RECENT TRAINING HISTORY (last 14 days):
${formatTrainingHistory(history)}

MUSCLE RECOVERY STATUS:
${formatMuscleRecovery(muscleRecovery)}

DECISION RULES:
1. If readiness score < 40: recommend rest or active recovery.
2. If a muscle group is < 50% recovered: do NOT program exercises for it; substitute.
3. For progressive overload: increase load by 2.5–5kg when RPE was 7 or below on last session for that exercise.
4. On deload weeks (every 4th week or after signs of accumulated fatigue): reduce volume by 40%, intensity by 10%.
5. Always explain the reasoning behind every decision.

Respond ONLY with a valid JSON object. No markdown, no text outside the JSON.

JSON Schema:
{
  "overall_readiness_score": <number 0-100>,
  "readiness_summary": "<1-2 sentences about today's physical state>",
  "recommendation": "<train|rest|active_recovery|deload>",
  "recommendation_reason": "<2-3 sentences explaining WHY>",
  "session": {
    "type": "<session name, e.g. Push Day, Full Body, Upper Body Hypertrophy>",
    "target_muscles": ["<muscle>"],
    "intensity": "<low|moderate|high>",
    "estimated_duration_minutes": <number>,
    "exercises": [
      {
        "name": "<exercise name>",
        "target_muscles": ["<muscle>"],
        "sets": <number>,
        "reps": "<e.g. 8-10 or 5 or AMRAP>",
        "weight_note": "<specific advice e.g. Increase by 2.5kg from last session at 80kg>",
        "rest_seconds": <number>,
        "technique_tip": "<one specific actionable technique cue>"
      }
    ],
    "cardio": {
      "activity": "<e.g. Treadmill incline walk>",
      "duration_minutes": <number>,
      "intensity": "<e.g. Zone 2, 60-65% max HR>"
    },
    "pre_workout_note": "<motivational note + key focus for this session>"
  },
  "coaching_message": "<2-4 personalized sentences from coach to user>",
  "weak_points": ["<muscle groups or qualities to prioritize>"],
  "recovery_tips": "<advice for rest/recovery if applicable>"
}`
}

// ─── Main AI call ─────────────────────────────────────────────────────────────

export async function runCoachBrain(
  supabase: SupabaseClient,
  userId: string,
  profile: UserFitnessProfile,
  readiness: DailyReadiness
): Promise<CoachDecision> {
  const history = await getTrainingHistory(supabase, userId)
  const muscleRecovery = computeMuscleRecovery(history)
  const prompt = buildCoachPrompt(profile, readiness, history, muscleRecovery)

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Mova Coach Brain',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4-6',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3, // deterministic coaching decisions
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content

  if (!raw) throw new Error('Empty response from AI')

  try {
    return JSON.parse(raw) as CoachDecision
  } catch {
    throw new Error(`Invalid JSON from AI: ${raw.slice(0, 200)}`)
  }
}
