'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

const SLIDES = [
  {
    tag: 'YOUR PERSONAL',
    headline: ['AI', 'FITNESS', 'COACH'],
    accentWord: 'AI',
    body: 'Build muscle, lose fat, improve performance, and let AI optimize your training every day.',
  },
  {
    tag: 'TAILORED TO YOU',
    headline: ['AI-POWERED', 'PROGRAMS'],
    accentWord: 'AI-POWERED',
    body: 'Answer 6 quick questions and get a personalized training system built for your exact goals and level.',
  },
  {
    tag: 'STAY ON TRACK',
    headline: ['TRACK YOUR', 'PROGRESS'],
    accentWord: 'TRACK YOUR',
    body: 'Log every set, monitor volume, and watch your strength grow week over week with smart history.',
  },
  {
    tag: 'GYM OR HOME',
    headline: ['TRAIN', 'ANYWHERE'],
    accentWord: 'TRAIN',
    body: 'Programs adapt to your equipment — full gym, home setup, or bodyweight only. No excuses.',
  },
]

function GymBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Real gym photo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url('/gym-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }} />
      {/* Dark tint so text stays readable */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.52)',
      }} />
      {/* Bottom fade — smooth into dark background for CTAs */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        background: 'linear-gradient(180deg,transparent,rgba(5,5,5,0.82) 50%,rgba(5,5,5,0.98) 80%,#050505 100%)',
      }} />
      {/* Edge vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 110% 85% at 50% 35%,transparent 30%,rgba(0,0,0,0.55) 100%)',
      }} />
    </div>
  )
}

function MovaLogoSmall() {
  return (
    <div className="relative flex items-center justify-center">
      <div style={{ position: 'absolute', width: '60px', height: '60px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.5) 0%, transparent 70%)', filter: 'blur(6px)' }} />
      <svg width="36" height="32" viewBox="0 0 100 90" fill="none">
        <defs>
          <linearGradient id="mGradSmall" x1="50" y1="0" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CCFF44" />
            <stop offset="60%" stopColor="#5AE83A" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
        <path d="M 6,88 L 6,14 L 50,57 L 94,14 L 94,88 L 76,88 L 61,62 L 50,72 L 39,62 L 24,88 Z" fill="url(#mGradSmall)" />
      </svg>
    </div>
  )
}

export default function WelcomePage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/app/dashboard')
    })
  }, [router])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) < 40 || dy > 60) return
    if (dx < 0 && slide < SLIDES.length - 1) setSlide(s => s + 1)
    if (dx > 0 && slide > 0) setSlide(s => s - 1)
  }

  const s = SLIDES[slide]

  return (
    <div
      className="mobile-container flex flex-col select-none"
      style={{ background: '#080808', minHeight: '100dvh' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 40% at 50% 35%, rgba(34,197,94,0.12) 0%, transparent 65%)',
      }} />
      <GymBackground />

      {/* Top logo */}
      <div className="flex flex-col items-center pt-14 relative">
        <MovaLogoSmall />
        <div className="mt-2 text-center">
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.18em' }}>MOVA</span>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em', marginTop: '2px' }}>
            <span style={{ color: '#FFFFFF' }}>TRAIN </span>
            <span style={{ color: '#22C55E' }}>SMARTER</span>
            <span style={{ color: '#FFFFFF' }}> WITH AI</span>
          </p>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        <div
          key={slide}
          className="text-center animate-fade-in-up"
          style={{ animationDuration: '0.35s' }}
        >
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.1em', marginBottom: '6px' }}>
            {s.tag}
          </p>
          <h1 style={{ lineHeight: 1.0, fontWeight: 900, letterSpacing: '0.02em' }}>
            {s.headline.map((word, i) => (
              <span key={i}>
                <span style={{ fontSize: '52px', color: word === s.accentWord ? '#22C55E' : '#FFFFFF' }}>
                  {word}
                </span>
                {i < s.headline.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <div style={{ width: '48px', height: '4px', background: '#22C55E', borderRadius: '2px', margin: '20px auto 22px' }} />
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#9A9A9A' }}>{s.body}</p>
        </div>
      </div>

      {/* Bottom CTAs + dots */}
      <div className="px-5 pb-12 flex flex-col gap-3 relative">
        <Link
          href="/register"
          className="w-full flex items-center justify-center gap-3 transition-all active:scale-95"
          style={{ background: '#22C55E', borderRadius: '16px', padding: '18px 24px', fontWeight: 800, fontSize: '16px', letterSpacing: '0.08em', color: '#000000' }}
        >
          GET STARTED
          <span style={{ fontSize: '20px', fontWeight: 400 }}>→</span>
        </Link>

        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-3 transition-all active:scale-95"
          style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '18px 24px', fontWeight: 700, fontSize: '16px', letterSpacing: '0.08em', color: '#FFFFFF', background: 'rgba(255,255,255,0.04)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          LOG IN
        </Link>

        <div className="flex justify-center items-center gap-2 mt-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? '22px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === slide ? '#22C55E' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s',
                border: 'none',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
