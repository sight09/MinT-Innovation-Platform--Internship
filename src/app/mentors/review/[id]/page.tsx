'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Shield, CheckCircle, ArrowLeft, Loader2, Flag } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const DIMENSIONS = [
  { key: 'problemSignificance', label: 'Problem Significance & Impact', desc: 'Is the problem real, urgent, and impacting many Ethiopians or businesses?' },
  { key: 'problemClarity', label: 'Problem Clarity & Evidence', desc: 'Is the problem statement supported by specific data, interviews, or market research?' },
  { key: 'innovation', label: 'Innovation & Technology', desc: 'Is the solution genuinely innovative or applying technology effectively?' },
  { key: 'technicalFeasibility', label: 'Technical Feasibility', desc: 'Is the technology realistic to build and maintain within Ethiopia\'s infrastructure?' },
  { key: 'marketPotential', label: 'Market Potential & Size', desc: 'Is there a sizable addressable market or customer base?' },
  { key: 'businessModel', label: 'Business & Revenue Model', desc: 'Is there a clear, realistic pathway to monetization?' },
  { key: 'scalability', label: 'Scalability', desc: 'Can this model expand regionally or nationally?' },
  { key: 'teamReadiness', label: 'Team Capability & Commitment', desc: 'Does the team have the skills and dedication required?' },
  { key: 'traction', label: 'Traction & Validation', desc: 'Has the startup demonstrated early user usage or interest?' },
  { key: 'overallReadiness', label: 'Overall Startup Readiness', desc: 'Overall assessment of readiness for mentorship/investment.' },
]

export default function MentorReviewPage() {
  const router = useRouter()
  const params = useParams()
  const startupId = params?.id as string

  const [scores, setScores] = useState<Record<string, number>>({
    problemSignificance: 7, problemClarity: 7, innovation: 7,
    technicalFeasibility: 7, marketPotential: 7, businessModel: 7,
    scalability: 7, teamReadiness: 7, traction: 7, overallReadiness: 7,
  })

  const [feedback, setFeedback] = useState('')
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [isFlagged, setIsFlagged] = useState(false)
  const [loading, setLoading] = useState(false)

  const avgScore = (Object.values(scores).reduce((a, b) => a + b, 0) / 10).toFixed(1)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (feedback.length < 50) {
      toast.error('Please provide at least 50 characters of general feedback')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/mentors/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId,
          ...scores,
          generalFeedback: feedback,
          strengths,
          weaknesses,
          recommendations,
          isFlagged,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit review')
        return
      }

      toast.success('Mentor review submitted successfully!')
      router.push('/dashboard')
    } catch {
      toast.error('An error occurred during submission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px 64px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/startups/${startupId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to Startup
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={24} color="#4ADE80" />
          <h1 style={{ margin: 0 }}>MInT Mentor Startup Evaluation</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          Evaluate this startup across 10 structured dimensions to provide constructive guidance and inform investment readiness scores.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Score Summary Box */}
        <div className="card" style={{ background: 'rgba(27,79,155,0.15)', border: '1px solid rgba(27,79,155,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Computed Average Rating</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FBBF24', lineHeight: 1 }}>
              {avgScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 10</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFlagged(f => !f)}
            className={`btn btn-sm ${isFlagged ? 'btn-green' : 'btn-outline'}`}
          >
            <Flag size={14} fill={isFlagged ? '#fff' : 'none'} />
            {isFlagged ? 'Flagged as High Potential' : 'Flag as High Potential'}
          </button>
        </div>

        {/* 10 Dimensions Rating */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3>Dimension Scoring (1–10)</h3>

          {DIMENSIONS.map((dim) => (
            <div key={dim.key} style={{ paddingBottom: 16, borderBottom: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {dim.label}
                </label>
                <span style={{ fontWeight: 800, color: '#FBBF24', fontSize: '1.1rem' }}>
                  {scores[dim.key]} / 10
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                {dim.desc}
              </div>

              {/* 1-10 Slider / Button group */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScores(prev => ({ ...prev, [dim.key]: val }))}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 6,
                      background: scores[dim.key] === val ? '#2563EB' : 'var(--surface-elevated)',
                      border: `1px solid ${scores[dim.key] === val ? '#3B82F6' : 'var(--surface-border)'}`,
                      color: scores[dim.key] === val ? '#fff' : 'var(--text-muted)',
                      fontWeight: scores[dim.key] === val ? 800 : 400,
                      fontSize: '0.8rem', cursor: 'pointer', transition: 'all 100ms',
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Written Feedback */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3>Qualitative Feedback & Guidance</h3>

          <div className="form-group">
            <label className="form-label">General Feedback * (Min 50 characters)</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Provide detailed, constructive feedback for the founders..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Strengths</label>
            <input
              className="input"
              placeholder="e.g. Strong localized problem validation, solid technical background"
              value={strengths}
              onChange={e => setStrengths(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Weaknesses / Risks</label>
            <input
              className="input"
              placeholder="e.g. Monetization relies heavily on cooperative adoption speed"
              value={weaknesses}
              onChange={e => setWeaknesses(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Actionable Recommendations</label>
            <input
              className="input"
              placeholder="e.g. Formalize partnership with regional agriculture bureaus before next seed ask"
              value={recommendations}
              onChange={e => setRecommendations(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ justifyContent: 'center' }}>
          {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting Evaluation...</> : 'Publish Evaluation'}
        </button>
      </form>
    </div>
  )
}
