'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExpressInterestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const startupId = searchParams.get('startupId')

  const [loading, setLoading] = useState(false)
  const [startupName, setStartupName] = useState('Loading...')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!startupId) {
      router.push('/startups')
      return
    }
    // Fetch startup basic info
    fetch(`/api/startups?search=${startupId}`)
      .then(res => res.json())
      .then(data => {
        const startup = data.startups?.find((s: any) => s.id === startupId)
        if (startup) {
          setStartupName(startup.name)
        } else {
          setStartupName('Startup')
        }
      })
      .catch(() => setStartupName('Startup'))
  }, [startupId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message) {
      toast.error('Please include a message for the startup founders')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/investors/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId, message }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to express interest')
        return
      }

      toast.success('Interest expressed successfully!')
      router.push('/dashboard/investor/interests')
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/startups/${startupId}`} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
          <ArrowLeft size={16} /> Back to Profile
        </Link>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'rgba(0,107,107,0.1)', border: '1px solid rgba(0,107,107,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={32} color="var(--mint-teal)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 8px' }}>Express Investment Interest</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Connect with the founders of <strong>{startupName}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
          <div className="form-group">
            <label>Message to Founders</label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>
              Briefly explain why you are interested and what kind of investment or support you can offer.
            </p>
            <textarea
              className="input"
              rows={5}
              placeholder="Hi team, I'm impressed by your traction in the agriculture sector. I represent an angel syndicate looking to invest..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => router.back()} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold" style={{ flex: 2 }} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Send Interest</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
