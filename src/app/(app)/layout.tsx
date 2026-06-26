import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/actions/auth'
import { Button } from '@/components/ui/Button'

const navLinks = [
  { href: '/app/dashboard', label: 'Dashboard' },
  { href: '/app/coach', label: 'AI Coach' },
  { href: '/app/chat', label: 'Chat' },
  { href: '/app/workout', label: 'Workout Generator' },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex h-full min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-100">
          <span className="text-xl font-bold text-green-600">Mova</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 truncate mb-2">{user?.email}</p>
          <form action={signOut}>
            <Button type="submit" variant="ghost" className="w-full text-left text-gray-600">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
