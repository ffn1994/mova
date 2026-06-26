export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface WorkoutPlan {
  id: string
  user_id: string
  title: string
  content: string
  inputs: WorkoutFormInputs | null
  created_at: string
  updated_at: string
}

export interface WorkoutFormInputs {
  goal: 'lose_weight' | 'build_muscle' | 'improve_endurance'
  daysPerWeek: number
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  equipment: 'none' | 'dumbbells' | 'gym'
}

// ─── Coach Brain Types ────────────────────────────────────────────────────────

export interface UserFitnessProfile {
  user_id: string
  goal: 'lose_weight' | 'build_muscle' | 'improve_endurance'
  fitness_level: 'beginner' | 'intermediate' | 'advanced'
  days_per_week: number
  equipment: 'none' | 'dumbbells' | 'gym'
}

export interface DailyReadiness {
  id?: string
  user_id?: string
  date?: string
  sleep_hours: number
  sleep_quality: number        // 1-5
  energy_level: number         // 1-5
  physical_work_fatigue: 0 | 1 | 2 | 3  // none, light, moderate, heavy
  stress_level: number         // 1-5
  hydration: number            // 1-5
  nutrition_yesterday: number  // 1-5
  user_fatigue: number         // 1-5
  notes?: string
}

export interface ExerciseSet {
  set_number: number
  weight_kg: number | null
  reps: number | null
  rpe: number | null
  notes?: string
}

export interface ExerciseFeedback {
  technique_confidence: number  // 1-5
  difficulty: number            // 1-5
  weight_feel: 'too_light' | 'appropriate' | 'too_heavy'
  soreness_prediction?: 'none' | 'mild' | 'moderate' | 'severe'
}

export interface WorkoutExercise {
  id?: string
  exercise_id: string
  exercise_name: string
  sort_order: number
  target_muscles: string[]
  sets: ExerciseSet[]
  feedback?: ExerciseFeedback
}

export interface WorkoutSession {
  id?: string
  user_id?: string
  date?: string
  session_type: string
  duration_minutes?: number
  overall_rpe?: number
  notes?: string
  exercises: WorkoutExercise[]
}

// ─── Coach Decision (AI output) ───────────────────────────────────────────────

export interface CoachExercise {
  name: string
  target_muscles: string[]
  sets: number
  reps: string          // e.g. "8-10", "5", "AMRAP"
  weight_note: string   // e.g. "Increase by 2.5kg from last session"
  rest_seconds: number
  technique_tip: string
}

export interface CoachCardio {
  activity: string
  duration_minutes: number
  intensity: string
}

export interface CoachSession {
  type: string
  target_muscles: string[]
  intensity: 'low' | 'moderate' | 'high'
  estimated_duration_minutes: number
  exercises: CoachExercise[]
  cardio?: CoachCardio
  pre_workout_note: string
}

export interface CoachDecision {
  overall_readiness_score: number  // 0-100
  readiness_summary: string
  recommendation: 'train' | 'rest' | 'active_recovery' | 'deload'
  recommendation_reason: string
  session?: CoachSession
  coaching_message: string
  weak_points?: string[]
  recovery_tips?: string
}

export interface AiCoachingSession {
  id: string
  user_id: string
  date: string
  readiness_id: string | null
  decision: CoachDecision
  created_at: string
}
