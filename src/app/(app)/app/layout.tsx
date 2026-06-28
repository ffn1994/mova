import { BottomNav } from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-container flex flex-col" style={{ background: '#0D0D0D', minHeight: '100dvh' }}>
      <main className="flex-1 flex flex-col pb-nav overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
