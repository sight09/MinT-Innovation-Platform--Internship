// MInT Platform — Email Service (Resend)
// Docs: https://resend.com/docs/send-with-nextjs

import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const APP_URL = process.env.APP_URL || 'http://localhost:3000'

// Only instantiate Resend when a real key is present
const resend = apiKey && !apiKey.startsWith('re_replace') ? new Resend(apiKey) : null

function devLog(subject: string, to: string, body: string) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`[EMAIL DEV MODE] To: ${to}`)
  console.log(`[EMAIL DEV MODE] Subject: ${subject}`)
  console.log(`[EMAIL DEV MODE] Body:\n${body}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  otpCode: string
): Promise<void> {
  const subject = 'Verify your MInT Platform account'
  const textBody = `Hi ${name},\n\nYour email verification code is: ${otpCode}\n\nThis code expires in 15 minutes.\n\n— MInT Innovation Platform Team`

  const htmlBody = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#F2F8F9;font-family:system-ui,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F8F9;padding:40px 20px;"><tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(9,105,118,0.10);"><tr><td style="background:linear-gradient(135deg,#0C4D60 0%,#096976 100%);padding:32px 40px;text-align:center;"><div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.02em;">MinT</div><div style="font-size:10px;color:rgba(255,255,255,0.65);letter-spacing:0.12em;font-weight:700;text-transform:uppercase;margin-top:2px;">Innovation Platform</div></td></tr><tr><td style="padding:40px;"><p style="color:#0A2540;font-size:18px;font-weight:700;margin:0 0 8px;">Verify your email address</p><p style="color:#64748B;font-size:14px;margin:0 0 28px;">Hi ${name}, use the code below to verify your MInT account.</p><div style="background:#F2F8F9;border:2px dashed #0F5567;border-radius:12px;text-align:center;padding:24px;margin-bottom:28px;"><div style="font-size:36px;font-weight:900;letter-spacing:0.25em;color:#0F5567;font-family:monospace;">${otpCode}</div></div><p style="color:#94A3B8;font-size:12px;margin:0;">This code expires in <strong>15 minutes</strong>. If you didn't request this, ignore this email.</p></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #F1F5F9;text-align:center;"><p style="color:#CBD5E1;font-size:11px;margin:0;">MInT Innovation Platform &mdash; Ministry of Innovation and Technology, Ethiopia</p></td></tr></table></td></tr></table></body></html>`

  if (!resend) {
    devLog(subject, to, `OTP Code: ${otpCode}`)
    return
  }
  await resend.emails.send({ from: FROM, to, subject, html: htmlBody, text: textBody })
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`
  const subject = 'Reset your MInT Platform password'
  const textBody = `Hi ${name},\n\nReset your password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.\n\n— MInT Innovation Platform Team`

  const htmlBody = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#F2F8F9;font-family:system-ui,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F8F9;padding:40px 20px;"><tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(9,105,118,0.10);"><tr><td style="background:linear-gradient(135deg,#0C4D60 0%,#096976 100%);padding:32px 40px;text-align:center;"><div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.02em;">MinT</div><div style="font-size:10px;color:rgba(255,255,255,0.65);letter-spacing:0.12em;font-weight:700;text-transform:uppercase;margin-top:2px;">Innovation Platform</div></td></tr><tr><td style="padding:40px;"><p style="color:#0A2540;font-size:18px;font-weight:700;margin:0 0 8px;">Reset your password</p><p style="color:#64748B;font-size:14px;margin:0 0 28px;">Hi ${name}, click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p><div style="text-align:center;margin-bottom:28px;"><a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#0D4C60 0%,#096976 100%);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;">Reset Password</a></div><p style="color:#94A3B8;font-size:12px;word-break:break-all;margin:0 0 8px;">Or copy: ${resetUrl}</p><hr style="border:none;border-top:1px solid #F1F5F9;margin:24px 0;"><p style="color:#94A3B8;font-size:12px;margin:0;">If you didn't request this, your password will remain unchanged.</p></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #F1F5F9;text-align:center;"><p style="color:#CBD5E1;font-size:11px;margin:0;">MInT Innovation Platform &mdash; Ministry of Innovation and Technology, Ethiopia</p></td></tr></table></td></tr></table></body></html>`

  if (!resend) {
    devLog(subject, to, `Reset URL: ${resetUrl}`)
    return
  }
  await resend.emails.send({ from: FROM, to, subject, html: htmlBody, text: textBody })
}
