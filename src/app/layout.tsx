import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AiChatWidget } from '@/components/ai/AiChatWidget'

export const metadata: Metadata = {
  title: {
    template: '%s | MInT Innovation Platform',
    default: 'MInT Innovation Platform — Ethiopian Startup Ecosystem',
  },
  description:
    'A digital ecosystem connecting Ethiopian startups, MInT mentors, investors and government to transform ideas into scalable solutions. Powered by the Ministry of Innovation and Technology.',
  keywords: ['Ethiopia', 'startup', 'innovation', 'MInT', 'ministry', 'mentorship', 'investment', 'ecosystem'],
  openGraph: {
    title: 'MInT Innovation Platform',
    description: 'Connecting Ethiopian Innovation with Opportunity',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Public Sans — primary sans-serif for all functional/app surfaces */}
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Fraunces — serif used only for hero headlines and the logo wordmark */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <AiChatWidget />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#0F5567',
              border: '1px solid #D8E4EE',
              borderRadius: '10px',
              fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(13,43,78,0.12)',
            },
            success: {
              iconTheme: { primary: '#006B6B', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#C0392B', secondary: '#FFFFFF' },
            },
          }}
        />
      </body>
    </html>
  )
}
