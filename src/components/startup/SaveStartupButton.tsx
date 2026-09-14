'use client'

import { useState } from 'react'
import { Bookmark, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SaveStartupButtonProps {
  startupId: string
  initialSaved: boolean
  compact?: boolean
}

export function SaveStartupButton({ startupId, initialSaved, compact = false }: SaveStartupButtonProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggleSaved() {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/investors/saved', {
        method: saved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to update saved startup')

      setSaved(!saved)
      router.refresh()
    } catch (error) {
      console.error('Saved startup toggle error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      disabled={loading}
      className={compact ? 'btn btn-ghost btn-sm' : 'btn btn-outline btn-sm'}
      aria-label={saved ? 'Remove startup from saved list' : 'Save startup'}
      title={saved ? 'Remove from saved startups' : 'Save startup'}
      style={{ gap: 6 }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />}
      {!compact && (saved ? 'Saved' : 'Save')}
    </button>
  )
}
