import Link from 'next/link'

const cards = [
  {
    href: '/app/coach',
    title: 'AI Coach',
    description: 'Get your personalized daily training decision based on readiness, recovery, and history.',
    emoji: '🧠',
    featured: true,
  },
  {
    href: '/app/chat',
    title: 'Chat Coach',
    description: 'Ask your AI fitness coach anything about training, nutrition, and recovery.',
    emoji: '💬',
    featured: false,
  },
  {
    href: '/app/workout',
    title: 'Workout Generator',
    description: 'Create a generic workout plan template based on your goals and schedule.',
    emoji: '📋',
    featured: false,
  },
]

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">What would you like to do today?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {cards.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className={`rounded-xl border p-6 hover:shadow-sm transition-all ${card.featured ? 'border-green-300 bg-green-50 hover:border-green-400 sm:col-span-2' : 'border-gray-200 bg-white hover:border-green-300'}`}
          >
            <div className="text-3xl mb-3">{card.emoji}</div>
            <h2 className="font-semibold text-gray-900 mb-1">{card.title}</h2>
            <p className="text-sm text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
