export interface Exercise {
  id: string
  name: string
  primary_muscles: string[]
  secondary_muscles: string[]
  equipment: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'kettlebell'
  category: 'push' | 'pull' | 'legs' | 'core' | 'cardio'
}

export const MUSCLE_GROUPS = [
  'chest', 'lats', 'upper_back', 'lower_back',
  'front_delts', 'side_delts', 'rear_delts',
  'biceps', 'triceps', 'forearms',
  'quads', 'hamstrings', 'glutes', 'calves',
  'core', 'traps',
] as const

export type MuscleGroup = typeof MUSCLE_GROUPS[number]

export const EXERCISE_LIBRARY: Exercise[] = [
  // ── PUSH ──────────────────────────────────────────────────────────────────
  { id: 'bench_press', name: 'Bench Press', primary_muscles: ['chest'], secondary_muscles: ['front_delts', 'triceps'], equipment: 'barbell', category: 'push' },
  { id: 'incline_bench_press', name: 'Incline Bench Press', primary_muscles: ['chest', 'front_delts'], secondary_muscles: ['triceps'], equipment: 'barbell', category: 'push' },
  { id: 'dumbbell_chest_press', name: 'Dumbbell Chest Press', primary_muscles: ['chest'], secondary_muscles: ['front_delts', 'triceps'], equipment: 'dumbbell', category: 'push' },
  { id: 'overhead_press', name: 'Overhead Press', primary_muscles: ['front_delts', 'side_delts'], secondary_muscles: ['triceps', 'traps'], equipment: 'barbell', category: 'push' },
  { id: 'dumbbell_shoulder_press', name: 'Dumbbell Shoulder Press', primary_muscles: ['front_delts', 'side_delts'], secondary_muscles: ['triceps'], equipment: 'dumbbell', category: 'push' },
  { id: 'lateral_raise', name: 'Lateral Raise', primary_muscles: ['side_delts'], secondary_muscles: [], equipment: 'dumbbell', category: 'push' },
  { id: 'dips', name: 'Dips', primary_muscles: ['chest', 'triceps'], secondary_muscles: ['front_delts'], equipment: 'bodyweight', category: 'push' },
  { id: 'push_ups', name: 'Push-Ups', primary_muscles: ['chest'], secondary_muscles: ['front_delts', 'triceps', 'core'], equipment: 'bodyweight', category: 'push' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', primary_muscles: ['triceps'], secondary_muscles: [], equipment: 'cable', category: 'push' },
  { id: 'skull_crushers', name: 'Skull Crushers', primary_muscles: ['triceps'], secondary_muscles: [], equipment: 'barbell', category: 'push' },
  { id: 'cable_fly', name: 'Cable Fly', primary_muscles: ['chest'], secondary_muscles: ['front_delts'], equipment: 'cable', category: 'push' },
  { id: 'face_pulls', name: 'Face Pulls', primary_muscles: ['rear_delts', 'upper_back'], secondary_muscles: ['biceps'], equipment: 'cable', category: 'push' },

  // ── PULL ──────────────────────────────────────────────────────────────────
  { id: 'pull_ups', name: 'Pull-Ups', primary_muscles: ['lats'], secondary_muscles: ['biceps', 'upper_back'], equipment: 'bodyweight', category: 'pull' },
  { id: 'chin_ups', name: 'Chin-Ups', primary_muscles: ['lats', 'biceps'], secondary_muscles: ['upper_back'], equipment: 'bodyweight', category: 'pull' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', primary_muscles: ['lats'], secondary_muscles: ['biceps', 'upper_back'], equipment: 'machine', category: 'pull' },
  { id: 'barbell_row', name: 'Barbell Row', primary_muscles: ['upper_back', 'lats'], secondary_muscles: ['biceps', 'lower_back'], equipment: 'barbell', category: 'pull' },
  { id: 'dumbbell_row', name: 'Dumbbell Row', primary_muscles: ['lats', 'upper_back'], secondary_muscles: ['biceps'], equipment: 'dumbbell', category: 'pull' },
  { id: 'cable_row', name: 'Seated Cable Row', primary_muscles: ['upper_back', 'lats'], secondary_muscles: ['biceps'], equipment: 'cable', category: 'pull' },
  { id: 'bicep_curl', name: 'Barbell Bicep Curl', primary_muscles: ['biceps'], secondary_muscles: ['forearms'], equipment: 'barbell', category: 'pull' },
  { id: 'dumbbell_curl', name: 'Dumbbell Curl', primary_muscles: ['biceps'], secondary_muscles: ['forearms'], equipment: 'dumbbell', category: 'pull' },
  { id: 'hammer_curl', name: 'Hammer Curl', primary_muscles: ['biceps', 'forearms'], secondary_muscles: [], equipment: 'dumbbell', category: 'pull' },
  { id: 'rear_delt_fly', name: 'Rear Delt Fly', primary_muscles: ['rear_delts'], secondary_muscles: ['upper_back'], equipment: 'dumbbell', category: 'pull' },
  { id: 'shrugs', name: 'Barbell Shrugs', primary_muscles: ['traps'], secondary_muscles: [], equipment: 'barbell', category: 'pull' },

  // ── LEGS ──────────────────────────────────────────────────────────────────
  { id: 'squat', name: 'Barbell Back Squat', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['hamstrings', 'lower_back', 'core'], equipment: 'barbell', category: 'legs' },
  { id: 'front_squat', name: 'Front Squat', primary_muscles: ['quads'], secondary_muscles: ['glutes', 'core'], equipment: 'barbell', category: 'legs' },
  { id: 'leg_press', name: 'Leg Press', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['hamstrings'], equipment: 'machine', category: 'legs' },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', primary_muscles: ['hamstrings', 'glutes'], secondary_muscles: ['lower_back'], equipment: 'barbell', category: 'legs' },
  { id: 'conventional_deadlift', name: 'Conventional Deadlift', primary_muscles: ['hamstrings', 'glutes', 'lower_back'], secondary_muscles: ['quads', 'traps', 'upper_back'], equipment: 'barbell', category: 'legs' },
  { id: 'lunges', name: 'Barbell Lunges', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['hamstrings'], equipment: 'barbell', category: 'legs' },
  { id: 'dumbbell_lunges', name: 'Dumbbell Lunges', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['hamstrings'], equipment: 'dumbbell', category: 'legs' },
  { id: 'leg_extension', name: 'Leg Extension', primary_muscles: ['quads'], secondary_muscles: [], equipment: 'machine', category: 'legs' },
  { id: 'leg_curl', name: 'Leg Curl', primary_muscles: ['hamstrings'], secondary_muscles: [], equipment: 'machine', category: 'legs' },
  { id: 'hip_thrust', name: 'Hip Thrust', primary_muscles: ['glutes'], secondary_muscles: ['hamstrings'], equipment: 'barbell', category: 'legs' },
  { id: 'calf_raise', name: 'Standing Calf Raise', primary_muscles: ['calves'], secondary_muscles: [], equipment: 'machine', category: 'legs' },
  { id: 'goblet_squat', name: 'Goblet Squat', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['core'], equipment: 'kettlebell', category: 'legs' },
  { id: 'step_ups', name: 'Step-Ups', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['hamstrings'], equipment: 'dumbbell', category: 'legs' },

  // ── CORE ──────────────────────────────────────────────────────────────────
  { id: 'plank', name: 'Plank', primary_muscles: ['core'], secondary_muscles: ['lower_back'], equipment: 'bodyweight', category: 'core' },
  { id: 'cable_crunch', name: 'Cable Crunch', primary_muscles: ['core'], secondary_muscles: [], equipment: 'cable', category: 'core' },
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', primary_muscles: ['core'], secondary_muscles: ['hip_flexors'], equipment: 'bodyweight', category: 'core' },
  { id: 'russian_twist', name: 'Russian Twist', primary_muscles: ['core'], secondary_muscles: [], equipment: 'bodyweight', category: 'core' },
  { id: 'ab_wheel', name: 'Ab Wheel Rollout', primary_muscles: ['core', 'lower_back'], secondary_muscles: ['lats'], equipment: 'bodyweight', category: 'core' },
]

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find(e => e.id === id)
}

export function getExercisesByMuscle(muscle: string): Exercise[] {
  return EXERCISE_LIBRARY.filter(e =>
    e.primary_muscles.includes(muscle) || e.secondary_muscles.includes(muscle)
  )
}

export function getMusclesTrainedInSession(exerciseIds: string[]): string[] {
  const muscles = new Set<string>()
  for (const id of exerciseIds) {
    const ex = getExerciseById(id)
    if (ex) {
      ex.primary_muscles.forEach(m => muscles.add(m))
    }
  }
  return Array.from(muscles)
}
