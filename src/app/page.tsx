'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
      {/* Dark tint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.5)',
      }} />
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(180deg,transparent,rgba(0,0,0,0.85) 55%,#000 100%)',
      }} />
      {/* Edge vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 110% 85% at 50% 35%,transparent 30%,rgba(0,0,0,0.55) 100%)',
      }} />
    </div>
  )
}

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/welcome'), 2500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between pb-14 pt-0" style={{ background: '#000000' }}>

      <GymBackground />

      {/* Diagonal light streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{
          position: 'absolute', top: '-5%', right: '10%',
          width: '1.5px', height: '75%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.08) 40%, transparent 100%)',
          transform: 'rotate(-28deg)',
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '20%',
          width: '1px', height: '55%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
          transform: 'rotate(-28deg)',
        }} />
        <div style={{
          position: 'absolute', top: '-10%', left: '15%',
          width: '1px', height: '45%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
          transform: 'rotate(-28deg)',
        }} />
      </div>

      {/* Center: Logo + brand */}
      <div className="flex-1 flex flex-col items-center justify-center gap-7">

        {/* M Logo with glow */}
        <div className="relative flex items-center justify-center">
          <div style={{
            position: 'absolute',
            width: '160px', height: '160px',
            background: 'radial-gradient(ellipse, rgba(34,197,94,0.55) 0%, rgba(34,197,94,0.15) 40%, transparent 70%)',
            filter: 'blur(18px)',
          }} />
          <svg width="120" height="108" viewBox="0 0 100 90" fill="none">
            <defs>
              <linearGradient id="mGrad" x1="50" y1="0" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#CCFF44" />
                <stop offset="60%" stopColor="#5AE83A" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
            </defs>
            <path
              d="M 6,88 L 6,14 L 50,57 L 94,14 L 94,88 L 76,88 L 61,62 L 50,72 L 39,62 L 24,88 Z"
              fill="url(#mGrad)"
            />
          </svg>
        </div>

        {/* Brand text */}
        <div className="flex flex-col items-center gap-2">
          <h1 style={{
            fontSize: '52px',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '0.18em',
            lineHeight: 1,
            fontFamily: 'inherit',
          }}>
            MOVA
          </h1>
          <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.22em' }}>
            <span style={{ color: '#FFFFFF' }}>TRAIN </span>
            <span style={{ color: '#22C55E' }}>SMARTER</span>
            <span style={{ color: '#FFFFFF' }}> WITH AI</span>
          </p>
        </div>
      </div>

      {/* Bottom: Spinner + LOADING */}
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin" width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="12" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
          <path d="M 15 3 A 12 12 0 0 1 27 15" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.45)' }}>
          LOADING...
        </p>
      </div>
    </div>
  )
}
