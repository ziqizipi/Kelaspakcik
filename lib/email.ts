/**
 * Email sending utilities.
 * Uses nodemailer — configure SMTP in environment variables.
 */

// @ts-ignore nodemailer has no types
import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.resend.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "resend",
    pass: process.env.SMTP_PASS || "",
  },
})

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "BalasBro.ai <noreply@balas.ai>",
    to,
    subject,
    html,
  })
}

export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl,
}: {
  to: string
  userName: string
  resetUrl: string
}): Promise<void> {
  await sendEmail({
    to,
    subject: "Reset Password — BalasBro.ai",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Halo ${userName},</h2>
  <p>Anda meminta reset password untuk akun BalasBro.ai Anda.</p>
  <p>Klik tombol di bawah untuk mereset password Anda:</p>
  <a href="${resetUrl}" style="display: inline-block; background: #3a7a55; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
  <p>Atau salin link ini ke browser Anda:<br/><a href="${resetUrl}">${resetUrl}</a></p>
  <p>Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>
  <p style="color: #666; font-size: 12px; margin-top: 32px;">BalasBro.ai — AI Customer Service Platform</p>
</body>
</html>
    `.trim(),
  })
}