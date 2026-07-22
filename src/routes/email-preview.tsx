import { createFileRoute } from '@tanstack/react-router'
import { render } from '@react-email/render'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'

export const Route = createFileRoute('/email-preview')({
  head: () => ({
    meta: [
      { title: 'OTP Email Preview — CareerPilot AI' },
      { name: 'description', content: 'Preview the exact OTP email users receive, without sending.' },
      { name: 'robots', content: 'noindex, nofollow' },
      { property: 'og:title', content: 'OTP Email Preview — CareerPilot AI' },
      { property: 'og:description', content: 'Internal preview of the OTP email template.' },
    ],
  }),
  component: EmailPreviewPage,
})

function EmailPreviewPage() {
  const [token, setToken] = useState('123456')
  const [html, setHtml] = useState('')
  const [plain, setPlain] = useState('')

  const element = useMemo(
    () => React.createElement(MagicLinkEmail, { siteName: 'CareerPilot AI', token }),
    [token]
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [h, t] = await Promise.all([
        render(element),
        render(element, { plainText: true }),
      ])
      if (!cancelled) {
        setHtml(h)
        setPlain(t)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [element])

  const hasLink = /https?:\/\//i.test(plain)

  return (
    <div style={{ minHeight: '100vh', background: '#0b1220', color: '#e5e7eb', padding: '32px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>OTP Email Preview</h1>
        <p style={{ fontSize: 14, opacity: 0.75, marginBottom: 20 }}>
          Renders the exact template your users receive — nothing is sent.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <label style={{ fontSize: 13 }}>
            Sample code:&nbsp;
            <input
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6) || '0')}
              maxLength={6}
              style={{
                background: '#111827',
                color: '#fff',
                border: '1px solid #374151',
                borderRadius: 6,
                padding: '6px 10px',
                fontFamily: 'monospace',
                letterSpacing: 4,
                width: 120,
              }}
            />
          </label>
          <span
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 999,
              background: hasLink ? '#7f1d1d' : '#064e3b',
              color: hasLink ? '#fecaca' : '#a7f3d0',
            }}
          >
            {hasLink ? '⚠ Link detected in email body' : '✓ No links — code only'}
          </span>
        </div>

        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>
          <section>
            <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, opacity: 0.7 }}>
              Rendered email
            </h2>
            <iframe
              title="OTP email preview"
              srcDoc={html}
              style={{ width: '100%', height: 520, border: '1px solid #1f2937', borderRadius: 12, background: '#fff' }}
            />
          </section>

          <section>
            <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, opacity: 0.7 }}>
              Plain-text version
            </h2>
            <pre
              style={{
                background: '#0f172a',
                border: '1px solid #1f2937',
                borderRadius: 12,
                padding: 16,
                whiteSpace: 'pre-wrap',
                fontSize: 13,
                color: '#e5e7eb',
              }}
            >
              {plain}
            </pre>
          </section>
        </div>
      </div>
    </div>
  )
}
