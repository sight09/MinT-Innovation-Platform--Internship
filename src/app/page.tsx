'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Sparkles, TrendingUp, Users, Shield, Star,
  ChevronRight, Play, Building2, Globe, Lightbulb, Target,
  BarChart3, MessageSquare, CheckCircle, Zap, Award,
  FileText, Rocket
} from 'lucide-react'
import { MintLogo } from '@/components/ui/MintLogo'
import { getStageLabel, getSectorColor, formatCurrency } from '@/lib/utils'

// ─── ANIMATED NETWORK CANVAS ─────────────────────────────────────────────────
function InnovationNetwork() {
  useEffect(() => {
    const canvas = document.getElementById('innovation-canvas') as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const nodes: Array<{ x: number; y: number; vx: number; vy: number; r: number; color: string; label?: string }> = []
    const colors = ['#006B6B', '#0F5567', '#D4891A', '#1A7A4A', '#008080', '#2563EB', '#006B6B']
    const labels = ['AI', 'AgriTech', 'FinTech', 'HealthTech', 'EdTech', 'MInT', 'Investors']

    for (let i = 0; i < 18; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: i < 7 ? 5 + Math.random() * 6 : 2 + Math.random() * 3,
        color: colors[i % colors.length],
        label: i < 7 ? labels[i] : undefined,
      })
    }

    let animFrame: number
    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 160) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0, 107, 107, ${0.25 * (1 - dist / 160)})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        // Glow
        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 3)
        grd.addColorStop(0, `${node.color}40`)
        grd.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()

        // Label
        if (node.label) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
          ctx.font = '10px Inter, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(node.label, node.x, node.y + node.r + 12)
        }

        // Move
        node.x += node.vx
        node.y += node.vy
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1
      }

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [])

  return (
    <canvas
      id="innovation-canvas"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity: 0.6,
      }}
    />
  )
}

// ─── DEMO STATS ───────────────────────────────────────────────────────────────
const STATS = [
  { value: '500+', label: 'Registered Startups', icon: Building2 },
  { value: '48', label: 'Verified MInT Mentors', icon: Shield },
  { value: '120', label: 'Active Investors', icon: TrendingUp },
  { value: '2.4B', label: 'ETB Funding Facilitated', icon: BarChart3 },
]

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { step: '01', icon: Building2, title: 'Startup Profile', desc: 'Founders create comprehensive profiles detailing their vision and team.' },
  { step: '02', icon: FileText, title: 'Problem Definition', desc: 'Startups clearly define the local problems they are solving and solutions.' },
  { step: '03', icon: Shield, title: 'Mentor Review', desc: 'Verified MInT mentors evaluate the startup across 10 dimensions.' },
  { step: '04', icon: Sparkles, title: 'Readiness Score', desc: 'Our AI computes a transparent readiness score based on feedback.' },
  { step: '05', icon: Building2, title: 'Investor Discovery', desc: 'Investors use AI matching to discover startups that fit their criteria.' },
  { step: '06', icon: TrendingUp, title: 'Investment Interest', desc: 'Investors express interest and connect directly to fund the future.' },
]

// ─── FEATURED STARTUPS (demo) ─────────────────────────────────────────────────
const FEATURED_STARTUPS = [
  { name: 'AgroMarket AI', sector: 'Agriculture', stage: 'MVP', tagline: 'Connecting smallholder farmers to fair markets using AI', readiness: 82, mentorScore: 8.2, funding: 2000000 },
  { name: 'HealthBridge Ethiopia', sector: 'HealthTech', stage: 'EARLY_TRACTION', tagline: 'Telemedicine making specialist care accessible in rural Ethiopia', readiness: 85, mentorScore: 8.6, funding: 3500000 },
  { name: 'FinFlow Ethiopia', sector: 'FinTech', stage: 'GROWTH', tagline: 'SME working capital financing powered by alternative credit scoring', readiness: 89, mentorScore: 9.2, funding: 10000000 },
]

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeNav, setActiveNav] = useState(false)
  const { scrollY } = useScroll()
  const navBg = useTransform(scrollY, [0, 80], ['rgba(13,43,78,0)', 'rgba(255,255,255,0.97)'])

  useEffect(() => {
    const unsub = scrollY.on('change', v => setActiveNav(v > 40))
    return unsub
  }, [scrollY])

  return (
    <div style={{ background: 'var(--surface-base)', minHeight: '100vh' }}>

      {/* ── NAVIGATION ───────────────────────────────────────────────────────── */}
      <motion.nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: navBg,
        backdropFilter: activeNav ? 'blur(20px)' : 'none',
        borderBottom: activeNav ? '1px solid var(--surface-border)' : '1px solid transparent',
        padding: '0 clamp(16px, 5vw, 48px)',
        height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'border-color 300ms, box-shadow 300ms',
        boxShadow: activeNav ? 'var(--shadow-sm)' : 'none',
      }}>
        <MintLogo size="sm" showText variant={activeNav ? 'light' : 'dark'} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/startups"
            className="btn btn-ghost"
            style={{ fontSize: '0.875rem', color: activeNav ? 'var(--text-secondary)' : 'rgba(255,255,255,0.85)' }}
          >
            Explore Startups
          </Link>
          <Link href="/login" className={activeNav ? 'btn btn-outline btn-sm' : 'btn btn-outline-white btn-sm'}>
            Sign In
          </Link>
          <Link href="/register" className="btn btn-gold btn-sm">
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="hero-bg" style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
      }}>
        <InnovationNetwork />

        {/* Gradient overlays */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to top, var(--surface-base), transparent)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 100 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            style={{ maxWidth: 760 }}
          >
            {/* Badge */}
            <div style={{ marginBottom: 20 }}>
              <span className="badge badge-blue" style={{ fontSize: '0.8rem' }}>
                <Sparkles size={12} />
                Powered by Ministry of Innovation and Technology — Ethiopia
              </span>
            </div>

            <h1 style={{ marginBottom: 20 }}>
              <span className="text-gradient-hero">
                Connecting Ethiopian Innovation
              </span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>
                with Opportunity
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'rgba(255,255,255,0.8)', marginBottom: 36, maxWidth: 600,
              lineHeight: 1.7,
            }}>
              A digital ecosystem where startups, MInT mentors, investors, and government 
              collaborate to transform Ethiopian ideas and problems into scalable solutions.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/startups" className="btn btn-gold btn-xl">
                Explore Startups
                <ArrowRight size={18} />
              </Link>
              <Link href="/register?role=STARTUP" className="btn btn-outline-white btn-xl">
                Submit Your Startup
                <ChevronRight size={18} />
              </Link>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {STATS.slice(0, 3).map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--surface-elevated)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <span className="badge badge-blue" style={{ marginBottom: 12 }}>How It Works</span>
            <h2>The Innovation Pipeline</h2>
            <p className="max-w-[520px] mx-auto mt-3">
              A transparent, structured journey from problem to investment
            </p>
          </motion.div>

          <div className="overflow-hidden w-full relative py-5">
            {/* Gradient masks for smooth edges */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to right, var(--surface-elevated), transparent)', zIndex: 10 }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left, var(--surface-elevated), transparent)', zIndex: 10 }} />
            
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
              style={{ display: 'flex', gap: 32, width: 'max-content', paddingLeft: 16 }}
            >
              {[...HOW_IT_WORKS, ...HOW_IT_WORKS].map(({ step, icon: Icon, title, desc }, i) => (
                <div
                  key={`${step}-${i}`}
                  className="card"
                  style={{ width: 320, flexShrink: 0, position: 'relative', whiteSpace: 'normal' }}
                >
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    fontSize: '2.5rem', fontWeight: 900, color: 'rgba(15,85,103,0.06)',
                    lineHeight: 1, fontFamily: "'Outfit', sans-serif",
                  }}>
                    {step}
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(15,85,103,0.10)', border: '1px solid rgba(15,85,103,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={20} color="#0F5567" />
                  </div>
                  <h4 style={{ marginBottom: 8, color: '#0F5567', whiteSpace: 'normal' }}>{title}</h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'normal' }}>{desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOR STARTUPS ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="badge badge-green" style={{ marginBottom: 12 }}>For Ethiopian Startups</span>
              <h2 style={{ marginBottom: 16 }}>Present Your Problem.<br />Get Structured Help.</h2>
              <p style={{ marginBottom: 24 }}>
                Submit your startup problem profile to receive structured mentorship from verified MInT experts, 
                an AI-computed readiness score, and discover investors who match your sector.
              </p>
              {[
                'AI-computed readiness score across 6 dimensions',
                'Structured feedback from verified MInT mentors',
                'Discover matched investors with match % explained',
                'Official MInT recognition and support programs',
                'Startup stage tracker with clear next milestones',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <CheckCircle size={16} color="#006B6B" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
              <div style={{ marginTop: 24 }}>
                <Link href="/register?role=STARTUP" className="btn btn-primary">
                  Register Your Startup <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

            {/* Readiness Score Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card"
              style={{ padding: 24 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Startup Readiness Score</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--mint-navy)', lineHeight: 1, fontFamily: "'Outfit',sans-serif" }}>82<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span></div>
                </div>
                <div className="badge badge-green" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>Strong</div>
              </div>

              {[
                { label: 'Problem Clarity', score: 90, color: '#006B6B' },
                { label: 'Innovation', score: 80, color: '#0F5567' },
                { label: 'Market Validation', score: 75, color: '#D4891A' },
                { label: 'Business Model', score: 72, color: '#1A7A4A' },
                { label: 'Team Readiness', score: 85, color: '#2563EB' },
                { label: 'Mentor Engagement', score: 88, color: '#006B6B' },
              ].map(({ label, score, color }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ color, fontWeight: 700 }}>{score}</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                      style={{ background: color }}
                    />
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: 'rgba(212,137,26,0.08)', border: '1px solid rgba(212,137,26,0.20)',
                borderRadius: 8, fontSize: '0.8rem', color: '#92400E',
              }}>
                💡 <strong>Biggest improvement area:</strong> Business Model — define your revenue model more clearly
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOR INVESTORS ───────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--surface-elevated)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <span className="badge badge-gold" style={{ marginBottom: 12 }}>For Investors</span>
            <h2>Discover AI-Matched Startups</h2>
            <p className="max-w-[520px] mx-auto mt-3">
              Every recommendation comes with a match score, mentor evaluation, and transparent reasoning
            </p>
          </motion.div>

          {/* Sample recommendation card */}
          <div className="max-w-[480px] mx-auto">
            <motion.div
              className="card"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #006B6B, #1A7A4A)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h4 style={{ marginBottom: 4 }}>FinFlow Ethiopia</h4>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="badge badge-blue">FinTech</span>
                    <span className="stage-badge stage-GROWTH">Growth</span>
                  </div>
                </div>
                <div className="match-score">
                  <Zap size={12} color="#006B6B" />
                  96% Match
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>
                SME working capital financing powered by alternative credit scoring
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Seeking', value: 'ETB 10M' },
                  { label: 'Readiness', value: '89/100' },
                  { label: 'Mentor Score', value: '9.2/10' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>WHY RECOMMENDED</div>
                {[
                  'Matches preferred sector: FinTech',
                  'Matches investment range (Growth stage)',
                  'Outstanding mentor evaluation: 9.2/10',
                  'Strong traction: 180M ETB loan book',
                ].map(reason => (
                  <div key={reason} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                    <CheckCircle size={12} color="#006B6B" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{reason}</span>
                  </div>
                ))}
              </div>

              <Link href="/register?role=INVESTOR" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                Register as Investor <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURED STARTUPS ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}
          >
            <div>
              <span className="badge badge-purple" style={{ marginBottom: 8 }}>Featured Opportunities</span>
              <h2>High-Readiness Startups</h2>
            </div>
            <Link href="/startups" className="btn btn-outline btn-sm">
              View All <ChevronRight size={14} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_STARTUPS.map((startup, i) => (
              <motion.div
                key={startup.name}
                className="card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, marginBottom: 10,
                      background: `${getSectorColor(startup.sector)}22`,
                      border: `1px solid ${getSectorColor(startup.sector)}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem',
                    }}>
                      {startup.sector === 'Agriculture' ? '🌾' : startup.sector === 'HealthTech' ? '🏥' : '💰'}
                    </div>
                    <h5 style={{ marginBottom: 4 }}>{startup.name}</h5>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="badge badge-gray">{startup.sector}</span>
                      <span className={`stage-badge stage-${startup.stage}`}>{getStageLabel(startup.stage as any)}</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '1.25rem', fontWeight: 900, color: '#006B6B', lineHeight: 1,
                    textAlign: 'right', fontFamily: "'Outfit',sans-serif",
                  }}>
                    {startup.readiness}
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>readiness</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.5 }}>{startup.tagline}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Seeking: <strong style={{ color: '#D4891A' }}>ETB {(startup.funding / 1000000).toFixed(1)}M</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Star size={12} color="#D4891A" fill="#D4891A" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#D4891A' }}>{startup.mentorScore}/10</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI ASSISTANT PREVIEW ─────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--surface-elevated)' }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="badge badge-purple" style={{ marginBottom: 12 }}>
                <Sparkles size={12} />
                MInT AI Innovation Assistant
              </span>
              <h2 style={{ marginBottom: 16 }}>AI-Powered.<br />Knowledge-Grounded.</h2>
              <p style={{ marginBottom: 20 }}>
                Ask anything about MInT programs, the Ethiopian startup proclamation, how to prepare for investors, 
                or get your startup analyzed. Every answer is grounded in official MInT documents and policies.
              </p>
              {[
                'Answers grounded in official MInT documents',
                'Ethiopian Startup Proclamation No. 1396/2025 knowledge',
                'Startup analysis and readiness assessment',
                'Investment preparation guidance',
                'Source citations for every regulatory answer',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <Sparkles size={14} color="#A78BFA" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </motion.div>

            {/* Mini chat preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{
                background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
                borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 16px 48px rgba(13,43,78,0.14), 0 0 24px rgba(0,107,107,0.12)',
              }}
            >
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--surface-border)',
                background: 'linear-gradient(135deg, rgba(0,107,107,0.15), rgba(0,107,107,0.05))',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1B4F9B, #2563EB)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={14} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>MInT Innovation Assistant</div>
                  <div style={{ fontSize: '0.65rem', color: '#4ADE80' }}>● RAG-powered · Always available</div>
                </div>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200 }}>
                <div style={{ alignSelf: 'flex-end', background: 'rgba(27,79,155,0.3)', borderRadius: '16px 4px 16px 16px', padding: '8px 12px', maxWidth: '80%', fontSize: '0.8125rem' }}>
                  What does the Ethiopian startup proclamation say about tax benefits?
                </div>
                <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '4px 16px 16px 16px', padding: '10px 12px', maxWidth: '90%', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  According to <strong style={{ color: '#93C5FD' }}>Proclamation No. 1396/2025</strong>, designated startups receive: income tax exemptions, dividend tax exemptions, credit guarantee schemes, and a 3-year loss carry-forward provision...
                  <div style={{ marginTop: 8, padding: '4px 8px', background: 'rgba(27,79,155,0.1)', border: '1px solid rgba(27,79,155,0.2)', borderRadius: 6, fontSize: '0.7rem', color: '#60A5FA' }}>
                    📄 Source: Ethiopian Start-up Businesses Proclamation No. 1396/2025
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, rgba(13,43,78,0.06) 0%, rgba(0,107,107,0.06) 50%, rgba(212,137,26,0.06) 100%)',
              border: '1px solid rgba(0,107,107,0.20)',
              borderRadius: 24, padding: 'clamp(32px, 5vw, 64px)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,107,107,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

            <MintLogo size="md" showText style={{ justifyContent: 'center', marginBottom: 24 }} variant="light" />
            <h2 style={{ marginBottom: 12 }}>Join Ethiopia's Innovation Ecosystem</h2>
            <p style={{ maxWidth: 480, margin: '0 auto 32px' }}>
              Whether you're a startup solving a real Ethiopian problem, a MInT mentor shaping the next generation, 
              or an investor looking for high-potential opportunities — this platform is built for you.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register?role=STARTUP" className="btn btn-primary btn-lg">
                Register Startup <ArrowRight size={16} />
              </Link>
              <Link href="/register?role=INVESTOR" className="btn btn-gold btn-lg">
                Join as Investor
              </Link>
              <Link href="/startups" className="btn btn-outline btn-lg">
                Explore Startups
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{
        background: 'var(--surface-elevated)', borderTop: '1px solid var(--surface-border)',
        padding: '32px 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <MintLogo size="sm" showText />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              © 2025 Ministry of Innovation and Technology, Federal Democratic Republic of Ethiopia. 
              All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link href="/resources" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resources</Link>
              <a href="https://www.mint.gov.et" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mint.gov.et</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
