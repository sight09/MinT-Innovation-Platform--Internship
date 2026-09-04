import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Settings, Shield, Bell, Key } from 'lucide-react'

export const metadata = { title: 'Admin Settings' }

export default async function AdminSettingsPage() {
  const session = await auth()
  if (session?.user?.role !== 'MINT_ADMIN') redirect('/dashboard')

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Settings size={28} color="var(--text-primary)" />
          Platform Settings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage global configurations and administration preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Settings Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn" style={{ justifyContent: 'flex-start', background: 'var(--surface-border)' }}>
            <Shield size={18} /> General Security
          </button>
          <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Bell size={18} /> Notifications
          </button>
          <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Key size={18} /> API Integrations
          </button>
        </div>

        {/* Content Area */}
        <div className="card md:col-span-2" style={{ padding: 32 }}>
          <h3 style={{ marginTop: 0, marginBottom: 24, borderBottom: '1px solid var(--surface-border)', paddingBottom: 16 }}>
            General Security
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="form-group">
              <label className="form-label">Two-Factor Authentication (2FA)</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--background)', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Require 2FA for all Admin accounts</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mandatory for government security compliance.</div>
                </div>
                <input type="checkbox" defaultChecked disabled style={{ transform: 'scale(1.2)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Session Timeout</label>
              <select className="form-input" defaultValue="30">
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="120">2 Hours</option>
              </select>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Idle time before automatic logout.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Allowed IP Addresses</label>
              <textarea 
                className="form-input" 
                rows={3} 
                defaultValue="10.0.0.0/8&#10;192.168.1.0/24"
                placeholder="Enter IP ranges (one per line)"
              ></textarea>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Leave empty to allow all IP addresses.
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: 24, marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary">Save Configuration</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
