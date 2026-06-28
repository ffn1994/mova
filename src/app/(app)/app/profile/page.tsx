'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { getOnboardingData, getActiveProgram } from '@/actions/onboarding'
import { deleteAccount } from '@/actions/auth'

interface Profile {
  first_name?: string
  age?: number
  gender?: string
  height_cm?: number
  weight_kg?: number
  unit_preference?: string
  fitness_goal?: string
  fitness_level?: string
}

interface Program {
  training_system?: string
  estimated_weeks_to_goal?: number
}

function formatGoal(g?: string) {
  if (!g) return '—'
  return g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const GOALS = [
  { value: 'lose_fat', label: 'Lose Fat' },
  { value: 'build_muscle', label: 'Build Muscle' },
  { value: 'body_recomposition', label: 'Body Recomp' },
  { value: 'increase_strength', label: 'Increase Strength' },
  { value: 'improve_fitness', label: 'Improve Fitness' },
  { value: 'general_health', label: 'General Health' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ first_name: '', weight_kg: '', height_cm: '', fitness_goal: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    Promise.all([supabase.auth.getUser(), getOnboardingData(), getActiveProgram()]).then(
      ([{ data: { user } }, prof, prog]) => {
        setEmail(user?.email ?? '')
        setProfile(prof as Profile)
        setProgram(prog as Program)
        setLoading(false)
      }
    )
  }, [])

  function openEdit() {
    setEditForm({
      first_name: profile?.first_name ?? '',
      weight_kg: String(profile?.weight_kg ?? ''),
      height_cm: String(profile?.height_cm ?? ''),
      fitness_goal: profile?.fitness_goal ?? '',
    })
    setEditing(true)
  }

  async function saveEdit() {
    setSaving(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_onboarding').update({
        first_name: editForm.first_name,
        weight_kg: parseFloat(editForm.weight_kg) || null,
        height_cm: parseFloat(editForm.height_cm) || null,
        fitness_goal: editForm.fitness_goal,
      }).eq('user_id', user.id)
    }
    setProfile(prev => prev ? { ...prev, ...editForm, weight_kg: parseFloat(editForm.weight_kg), height_cm: parseFloat(editForm.height_cm) } : prev)
    setSaving(false)
    setEditing(false)
  }

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/welcome')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteAccount()
    if (result?.error) {
      setDeleteError(result.error)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const inputStyle: React.CSSProperties = { background: '#1A1A1A', border: '1px solid #2A2A2A', color: 'white' }

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10 flex flex-col gap-4" style={{ background: '#111' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
              <button onClick={() => setEditing(false)} style={{ color: '#666' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#B3B3B3' }}>Name</label>
              <input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} placeholder="Your name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#B3B3B3' }}>Weight ({profile?.unit_preference ?? 'kg'})</label>
                <input type="number" value={editForm.weight_kg} onChange={e => setEditForm(p => ({ ...p, weight_kg: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} placeholder="75" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#B3B3B3' }}>Height (cm)</label>
                <input type="number" value={editForm.height_cm} onChange={e => setEditForm(p => ({ ...p, height_cm: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} placeholder="175" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#B3B3B3' }}>Goal</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(g => (
                  <button key={g.value} onClick={() => setEditForm(p => ({ ...p, fitness_goal: g.value }))}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium text-left transition-all"
                    style={editForm.fitness_goal === g.value
                      ? { background: '#22C55E', color: 'black' }
                      : { background: '#1A1A1A', color: '#B3B3B3', border: '1px solid #2A2A2A' }
                    }>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={saveEdit} disabled={saving}
              className="w-full py-4 rounded-2xl font-bold text-base text-black mt-2 transition-all active:scale-95 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(22,163,74,0.1) 100%)', border: '2px solid rgba(34,197,94,0.3)' }}
        >
          {profile?.first_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <h1 className="text-xl font-bold text-white">{profile?.first_name || 'Athlete'}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#B3B3B3' }}>{email}</p>
      </div>

      {/* Program info */}
      {program && (
        <div className="p-4 rounded-2xl mb-5" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#22C55E' }}>CURRENT PROGRAM</p>
          <p className="font-bold text-white">{program.training_system ?? '—'}</p>
          <p className="text-sm mt-0.5" style={{ color: '#B3B3B3' }}>{program.estimated_weeks_to_goal ?? '—'} week timeline</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Goal', value: formatGoal(profile?.fitness_goal) },
          { label: 'Level', value: profile?.fitness_level ?? '—' },
          { label: 'Weight', value: profile?.weight_kg ? `${profile.weight_kg} ${profile.unit_preference ?? 'kg'}` : '—' },
          { label: 'Height', value: profile?.height_cm ? `${profile.height_cm} cm` : '—' },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
            <p className="text-xs mb-0.5 capitalize" style={{ color: '#666' }}>{s.label}</p>
            <p className="font-semibold text-white text-sm capitalize">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-2 mb-6">
        {[
          { label: 'Edit Profile', icon: '✏️', action: openEdit },
          { label: 'My Workout Program', icon: '📋', action: () => router.push('/app/workout') },
          { label: 'Workout History', icon: '📊', action: () => router.push('/app/history') },
          { label: 'Rebuild Program', icon: '🔄', action: () => router.push('/onboarding/personal?rebuild=true') },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className="flex items-center gap-4 p-4 rounded-xl text-left transition-all active:scale-95"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium text-white">{item.label}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto">
              <path d="M6 4L10 8L6 12" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95 mb-3"
        style={{ background: '#1A1A1A', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        Sign Out
      </button>

      {/* Delete account */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
        style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        Delete Account
      </button>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10" style={{ background: '#111' }}>
            <div className="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
              </svg>
            </div>

            <h3 className="text-xl font-bold text-white text-center mb-2">Delete Account?</h3>
            <p className="text-sm text-center mb-6" style={{ color: '#B3B3B3' }}>
              This will permanently delete your account, workout history, and all data. This cannot be undone.
            </p>

            {deleteError && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-400 mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {deleteError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{ background: '#EF4444', color: 'white' }}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(null) }}
                disabled={deleting}
                className="w-full py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                style={{ background: '#1A1A1A', color: '#B3B3B3', border: '1px solid #2A2A2A' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
