import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
  token,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {siteName} verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your verification code</Heading>
        <Text style={text}>
          Enter this 6-digit code on the {siteName} login screen. It expires shortly.
        </Text>
        <Text style={codeStyle}>{token || '123456'}</Text>
        <Text style={smallText}>
          If you opened this email on the same device and the code screen is not available, you can use this secure backup link:
        </Text>
        <Text style={linkText}>{confirmationUrl}</Text>
        <Text style={footer}>
          If you didn't request this code, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 18px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '34px',
  fontWeight: 'bold' as const,
  letterSpacing: '8px',
  color: '#0f172a',
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '14px',
  padding: '18px 20px',
  textAlign: 'center' as const,
  margin: '0 0 22px',
}
const smallText = { ...text, fontSize: '12px', color: '#64748b', margin: '0 0 8px' }
const linkText = { fontSize: '11px', color: '#2563eb', lineHeight: '1.5', wordBreak: 'break-all' as const, margin: '0 0 24px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
