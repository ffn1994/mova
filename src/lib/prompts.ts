import { WorkoutFormInputs } from '@/types'

export const SYSTEM_PROMPT_CHAT = `You are Mova, an expert AI fitness coach. You help users with workout programming, exercise technique, nutrition basics, recovery, and fitness goal setting.

Guidelines:
- Only answer questions related to fitness, exercise, training, nutrition, and health.
- For medical or injury questions, recommend the user consult a healthcare professional.
- Keep answers concise and actionable.
- If asked about anything unrelated to fitness, politely redirect to fitness topics.
- Use clear, motivating language.`

export function buildWorkoutPrompt(inputs: WorkoutFormInputs): string {
  const goalMap = {
    lose_weight: 'lose weight and improve body composition',
    build_muscle: 'build muscle and increase strength',
    improve_endurance: 'improve cardiovascular endurance and stamina',
  }

  const equipmentMap = {
    none: 'no equipment (bodyweight only)',
    dumbbells: 'dumbbells at home',
    gym: 'full gym access',
  }

  return `Create a detailed, personalized workout plan for someone with the following profile:

- Goal: ${goalMap[inputs.goal]}
- Training days per week: ${inputs.daysPerWeek}
- Fitness level: ${inputs.fitnessLevel}
- Available equipment: ${equipmentMap[inputs.equipment]}

Include:
1. Weekly training split (which muscle groups each day)
2. For each workout day: exercises, sets, reps/duration, and rest periods
3. A cardio recommendation
4. Key progression tips for their level

Format it clearly with headers and bullet points. Be specific with exercise names, sets, and reps.`
}
