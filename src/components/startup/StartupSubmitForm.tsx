'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const SECTORS = [
  'Agriculture', 'FinTech', 'HealthTech', 'EdTech',
  'Climate Tech', 'Logistics', 'AI & Machine Learning',
  'Cybersecurity', 'Manufacturing', 'Tourism', 'Energy',
  'Digital Services', 'E-Commerce', 'Other',
]

const STAGES = [
  { value: 'IDEA', label: 'Idea Stage', desc: 'Concept defined, conducting initial interviews' },
  { value: 'PROBLEM_VALIDATED', label: 'Problem Validated', desc: 'Problem validated with 20+ target users' },
  { value: 'PROTOTYPE', label: 'Prototype', desc: 'Working wireframes or low-fidelity prototype' },
  { value: 'MVP', label: 'MVP', desc: 'Minimum Viable Product built and in testing' },
  { value: 'EARLY_TRACTION', label: 'Early Traction', desc: 'Active paying users or validated usage metrics' },
  { value: 'GROWTH', label: 'Growth', desc: 'Scaling operations and expanding user base' },
]

export function StartupSubmitForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    name: initialData?.name || '', 
    tagline: initialData?.tagline || '', 
    sector: initialData?.sector || 'Agriculture', 
    stage: initialData?.stage || 'IDEA', 
    location: initialData?.location || 'Addis Ababa',
    foundedYear: initialData?.foundedYear || new Date().getFullYear(),
    problemStatement: initialData?.problemStatement || '', 
    problemSignificance: initialData?.problemSignificance || '', 
    targetAudience: initialData?.targetAudience || '',
    solutionDescription: initialData?.solutionDescription || '', 
    uniqueValueProp: initialData?.uniqueValueProp || '', 
    marketSize: initialData?.marketSize || '',
    businessModel: initialData?.businessModel || '', 
    revenueModel: initialData?.revenueModel || '', 
    currentTraction: initialData?.currentTraction || '', 
    userCount: initialData?.userCount || 0,
    fundingRequired: initialData?.fundingRequired || 1000000, 
    fundingCurrency: initialData?.fundingCurrency || 'ETB', 
    fundingUse: initialData?.fundingUse || '',
    mentorshipNeeds: initialData?.mentorshipNeeds || '',
  })

  function updateField(key: string, value: any) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {

    if (!formData.name || formData.problemStatement.length < 50) {
      toast.error('Please provide startup name and detailed problem statement (min 50 chars)')
      return
    }

    setLoading(true)
    try {
      const isEditing = !!initialData?.id
      const url = isEditing ? `/api/startups/${initialData.id}` : '/api/startups'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to save startup profile')
        return
      }

      toast.success(isEditing ? 'Startup profile updated!' : 'Startup profile created! Pending review.')
      router.push('/dashboard/startup/profile')
      router.refresh()
    } catch {
      toast.error('An error occurred while submitting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form 
      onSubmit={(e) => { e.preventDefault() }}
      style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 64 }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 4 }}>{initialData ? 'Edit Your Startup Profile' : 'Submit Your Startup Problem Profile'}</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Present the real Ethiopian problem you are solving to receive structured mentorship, 
          an AI readiness score, and investor exposure.
        </p>
      </div>

      {/* Progress Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[
          { num: 1, title: 'Basic Info' },
          { num: 2, title: 'The Problem' },
          { num: 3, title: 'Solution & Market' },
          { num: 4, title: 'Traction & Funding' },
        ].map(s => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 10,
              background: step === s.num ? 'rgba(27,79,155,0.25)' : 'var(--surface-card)',
              border: `1px solid ${step === s.num ? '#2563EB' : 'var(--surface-border)'}`,
              color: step === s.num ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer', textAlign: 'center', transition: 'all 150ms',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: step === s.num ? '#60A5FA' : 'inherit' }}>
              STEP 0{s.num}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.title}</div>
          </button>
        ))}
      </div>

      <div className="form-container">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card"
          style={{ marginBottom: 24 }}
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3>Basic Information</h3>

              <div className="form-group">
                <label className="form-label">Startup Name *</label>
                <input
                  className="input"
                  placeholder="e.g. AgroMarket AI"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline (One-line summary)</label>
                <input
                  className="input"
                  placeholder="e.g. Connecting smallholder grain farmers directly to buyers via AI"
                  value={formData.tagline}
                  onChange={e => updateField('tagline', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Primary Sector *</label>
                  <select
                    className="input select"
                    value={formData.sector}
                    onChange={e => updateField('sector', e.target.value)}
                  >
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location in Ethiopia *</label>
                  <input
                    className="input"
                    placeholder="e.g. Addis Ababa / Bahir Dar"
                    value={formData.location}
                    onChange={e => updateField('location', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Current Stage *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {STAGES.map(st => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => updateField('stage', st.value)}
                      style={{
                        background: formData.stage === st.value ? 'rgba(37,99,235,0.15)' : 'var(--surface-elevated)',
                        border: `1px solid ${formData.stage === st.value ? '#2563EB' : 'var(--surface-border)'}`,
                        borderRadius: 10, padding: 12, cursor: 'pointer', textAlign: 'left',
                        transition: 'all 150ms',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: formData.stage === st.value ? '#60A5FA' : 'var(--text-primary)' }}>
                        {st.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {st.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: The Problem */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3>The Problem Statement</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  A great problem statement explains who suffers, how severe the issue is, and why existing solutions fail.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Problem Statement * (Min 50 characters)</label>
                <textarea
                  className="input"
                  rows={5}
                  placeholder="Describe the exact problem your startup is solving in Ethiopia. Include specific data, location context, and who experiences this problem daily..."
                  value={formData.problemStatement}
                  onChange={e => updateField('problemStatement', e.target.value)}
                  required
                />
                <div style={{ fontSize: '0.75rem', color: formData.problemStatement.length >= 50 ? '#4ADE80' : 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                  {formData.problemStatement.length} / 50 min characters
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Problem Impact & Significance</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="How many people or businesses are affected by this problem in Ethiopia? What is the economic or social loss?"
                  value={formData.problemSignificance}
                  onChange={e => updateField('problemSignificance', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience / Persona</label>
                <input
                  className="input"
                  placeholder="e.g. Smallholder grain farmers in Amhara region & local cooperative unions"
                  value={formData.targetAudience}
                  onChange={e => updateField('targetAudience', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Solution & Market */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3>Solution & Value Proposition</h3>

              <div className="form-group">
                <label className="form-label">Solution Description</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Explain your product or technology solution. How does it directly address the problem above?"
                  value={formData.solutionDescription}
                  onChange={e => updateField('solutionDescription', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unique Value Proposition (UVP)</label>
                <input
                  className="input"
                  placeholder="e.g. Offline USSD interface in Amharic + voice-guided AI assistant"
                  value={formData.uniqueValueProp}
                  onChange={e => updateField('uniqueValueProp', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Business Model</label>
                  <input
                    className="input"
                    placeholder="e.g. 1.5% transaction commission + B2B subscription"
                    value={formData.businessModel}
                    onChange={e => updateField('businessModel', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Market Size Estimate</label>
                  <input
                    className="input"
                    placeholder="e.g. $350M addressable digital grain trade fee market"
                    value={formData.marketSize}
                    onChange={e => updateField('marketSize', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Traction & Funding */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3>Traction, Funding & Support Needed</h3>

              <div className="form-group">
                <label className="form-label">Current Traction Metrics</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Describe your current users, revenue, volume, or key achievements..."
                  value={formData.currentTraction}
                  onChange={e => updateField('currentTraction', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Active Users / Customers</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.userCount}
                    onChange={e => updateField('userCount', Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Funding Required</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.fundingRequired}
                    onChange={e => updateField('fundingRequired', Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="input select"
                    value={formData.fundingCurrency}
                    onChange={e => updateField('fundingCurrency', e.target.value)}
                  >
                    <option value="ETB">ETB (Ethiopian Birr)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Use of Funds Breakdown</label>
                <input
                  className="input"
                  placeholder="e.g. 60% engineering & USSD scale, 25% field onboarding, 15% operations"
                  value={formData.fundingUse}
                  onChange={e => updateField('fundingUse', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mentorship Needs</label>
                <input
                  className="input"
                  placeholder="What specific guidance do you need from MInT mentors?"
                  value={formData.mentorshipNeeds}
                  onChange={e => updateField('mentorshipNeeds', e.target.value)}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn btn-outline">
              Previous Step
            </button>
          ) : <div />}

          {step < 4 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} className="btn btn-primary">
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="btn btn-gold btn-lg" disabled={loading}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : (initialData ? 'Update Profile' : 'Submit Startup Profile')}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
