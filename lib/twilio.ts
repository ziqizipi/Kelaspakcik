import crypto from "crypto"
import { prisma } from "@/lib/prisma"

const ALGORITHM = "aes-256-gcm"

function getEncryptionKey(): Buffer {
  const hexKey =
    process.env.TWILIO_AUTH_TOKEN_ENCRYPTION_KEY ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    ""
  if (hexKey.length < 32) {
    throw new Error("TWILIO_AUTH_TOKEN_ENCRYPTION_KEY must be at least 32 hex characters")
  }
  return Buffer.from(hexKey.slice(0, 32), "hex")
}

export function encryptAuthToken(plainToken: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plainToken, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export function decryptAuthToken(encryptedBlob: string): string {
  const key = getEncryptionKey()
  const data = Buffer.from(encryptedBlob, "base64")
  const iv = data.subarray(0, 16)
  const tag = data.subarray(16, 32)
  const encrypted = data.subarray(32)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final("utf8")
}

export interface TwilioAccountData {
  id: string
  accountSid: string
  authToken: string
  whatsappNumber: string
  messagingServiceSid: string | null
  businessName: string | null
  webhookVerifyToken: string
  isActive: boolean
  businessId: string
}

export interface DecryptedTwilioAccount {
  id: string
  accountSid: string
  authToken: string
  whatsappNumber: string
  messagingServiceSid: string | null
  businessName: string | null
  businessId: string
}

/**
 * Get a Twilio account with its auth token decrypted.
 */
export async function getDecryptedTwilioAccount(
  where: { id?: string; accountSid?: string; businessId?: string }
): Promise<DecryptedTwilioAccount | null> {
  const account = await prisma.twilioAccount.findFirst({
    where,
    select: {
      id: true,
      accountSid: true,
      authToken: true,
      whatsappNumber: true,
      messagingServiceSid: true,
      businessName: true,
      webhookVerifyToken: true,
      isActive: true,
      businessId: true,
    },
  })
  if (!account) return null

  try {
    const decryptedToken = decryptAuthToken(account.authToken)
    return {
      id: account.id,
      accountSid: account.accountSid,
      authToken: decryptedToken,
      whatsappNumber: account.whatsappNumber,
      messagingServiceSid: account.messagingServiceSid,
      businessName: account.businessName,
      businessId: account.businessId,
    }
  } catch {
    // Stored unencrypted (legacy) — return as-is
    return {
      id: account.id,
      accountSid: account.accountSid,
      authToken: account.authToken,
      whatsappNumber: account.whatsappNumber,
      messagingServiceSid: account.messagingServiceSid,
      businessName: account.businessName,
      businessId: account.businessId,
    }
  }
}

export interface SendResult {
  waMsgId: string | null
  success: boolean
  error?: string
}

/**
 * Send a WhatsApp message via Twilio API.
 * Twilio WhatsApp uses the same REST API — messages go to/from whatsapp: numbers.
 */
export async function sendWhatsAppMessage(
  phone: string,
  content: string,
  account: DecryptedTwilioAccount
): Promise<SendResult> {
  const auth = Buffer.from(`${account.accountSid}:${account.authToken}`).toString("base64")
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${account.accountSid}/Messages.json`

  // Normalize: strip whatsapp: prefix if present, then prepend
  const normalizePhone = (p: string) => {
    const cleaned = p.startsWith("whatsapp:") ? p.slice(9) : p
    // Indonesian normalization: 08xx → 628xx, 0 prefix → 62
    if (cleaned.startsWith("0")) return "62" + cleaned.slice(1)
    if (cleaned.startsWith("8")) return "62" + cleaned
    return cleaned
  }

  const from = normalizePhone(account.whatsappNumber)
  const to = normalizePhone(phone)

  const payload = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: `whatsapp:${from}`,
    Body: content,
  })

  let attempt = 0
  const maxAttempts = 3
  let delay = 1000

  while (attempt < maxAttempts) {
    attempt++
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      })

      const data = await res.json()

      if (res.status === 429 || res.status === 503) {
        await sleep(delay)
        delay *= 2
        continue
      }

      if (!res.ok) {
        console.error(`[Twilio] Send attempt ${attempt} failed:`, data)
        if (attempt >= maxAttempts) {
          return { waMsgId: null, success: false, error: data?.message || "Send failed" }
        }
        await sleep(delay)
        delay *= 2
        continue
      }

      const twilioMsgSid: string | null = data.sid || null

      if (twilioMsgSid) {
        await logOutboundMessage(to, content, twilioMsgSid, from)
      }

      return { waMsgId: twilioMsgSid, success: true }
    } catch (err) {
      console.error(`[Twilio] Send attempt ${attempt} exception:`, err)
      if (attempt >= maxAttempts) {
        return { waMsgId: null, success: false, error: String(err) }
      }
      await sleep(delay)
      delay *= 2
    }
  }

  return { waMsgId: null, success: false, error: "Max retries exceeded" }
}

/**
 * Send a WhatsApp message using raw credentials (accountSid + authToken).
 * Convenience overload used when we don't have a full account object.
 */
export async function sendWhatsAppMessageRaw(
  phone: string,
  content: string,
  accountSid: string,
  authToken: string,
  whatsappNumber: string
): Promise<SendResult> {
  return sendWhatsAppMessage(phone, content, {
    id: "",
    accountSid,
    authToken,
    whatsappNumber,
    messagingServiceSid: null,
    businessName: null,
    businessId: "",
  })
}

/**
 * Verify HMAC-SHA1 signature from Twilio webhook.
 * Twilio signs the full URL + body with HMAC-SHA1 using the auth token.
 */
export function verifyTwilioSignature(
  url: string,
  body: string,
  signature: string,
  authToken: string
): boolean {
  if (!signature || !authToken) return false

  const encoder = new TextEncoder()

  // Twilio signature = HMAC-SHA1(concatenated(url + body), authToken) → base64
  const dataToSign = url + body
  const key = encoder.encode(authToken)
  const mac = crypto.createHmac("sha1", key)
  mac.update(dataToSign)
  const expected = mac.digest("base64")

  return timingSafeEqual(expected, signature)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

/**
 * Normalize a Twilio phone number to Indonesian format (without whatsapp: prefix).
 * Input: "whatsapp:+6281234567890", "+6281234567890", "081234567890", "6281234567890"
 * Output: "6281234567890"
 */
export function parsePhone(phone: string): string {
  const cleaned = phone.startsWith("whatsapp:") ? phone.slice(9) : phone
  const digits = cleaned.replace(/\D/g, "")
  if (digits.startsWith("0")) return "62" + digits.slice(1)
  if (digits.startsWith("62")) return digits
  if (digits.startsWith("8")) return "62" + digits
  return digits
}

async function logOutboundMessage(
  phone: string,
  content: string,
  waMsgId: string,
  whatsappNumber: string
): Promise<void> {
  try {
    const customer = await prisma.customer.findFirst({
      where: { phone },
      select: { id: true, businessId: true },
    })

    if (!customer) return

    const conversation = await prisma.conversation.findFirst({
      where: { customerId: customer.id, businessId: customer.businessId, status: "open" },
      select: { id: true },
    })

    if (!conversation) return

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content,
        direction: "OUTBOUND",
        status: "sent",
        waMsgId,
      },
    })

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    })
  } catch (err) {
    console.error("[Twilio] Failed to log outbound message:", err)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
