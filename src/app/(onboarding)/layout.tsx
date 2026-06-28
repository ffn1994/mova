export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-container" style={{ background: '#0D0D0D', minHeight: '100dvh' }}>
      {children}
    </div>
  )
}
