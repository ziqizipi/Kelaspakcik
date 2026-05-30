import { TOTP } from "otpauth"
import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const MFA_KEY_HEX =
  process.env.MFA_SECRET_ENCRYPTION_KEY ||
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  ""

/* ============ TOTP ============ */

function base32Encode(bytes: Uint8Array): string {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let bits = 0
  let value = 0
  let output = ""
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31]
  }
  return output
}

export function generateTOTPSecret(): string {
  const bytes = crypto.randomBytes(20)
  return base32Encode(bytes)
}

export function verifyTOTP(secret: string, token: string): boolean {
  const keyBytes = base32Decode(secret)
  const totp = new TOTP({
    issuer: "BalasBro.ai",
    label: "auth",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    secret: { kind: "bytes", bytes: keyBytes } as any,
  })
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}

function base32Decode(str: string): Uint8Array {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  const clean = str.toUpperCase().replace(/[^A-Z2-7]/g, "")
  const bits: number[] = []
  for (const char of clean) {
    const val = ALPHABET.indexOf(char)
    if (val === -1) continue
    bits.push(val)
  }
  const bytes: number[] = []
  let buffer = 0
  let bitsInBuffer = 0
  for (const bit of bits) {
    buffer = (buffer << 5) | bit
    bitsInBuffer += 5
    if (bitsInBuffer >= 8) {
      bytes.push((buffer >>> (bitsInBuffer - 8)) & 255)
      bitsInBuffer -= 8
    }
  }
  return new Uint8Array(bytes)
}

/* ============ Recovery Codes ============ */

export function generateRecoveryCodes(count: number = 8): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  )
}

export function hashRecoveryCode(code: string): string {
  return crypto.createHash("sha256").update(code.toLowerCase()).digest("hex")
}

/* ============ MFA Secret Encryption ============ */

function getCipherKey(): Buffer {
  if (MFA_KEY_HEX.length < 32) {
    throw new Error(
      "MFA_SECRET_ENCRYPTION_KEY must be at least 32 hex characters"
    )
  }
  return Buffer.from(MFA_KEY_HEX.slice(0, 32), "hex")
}

export function encryptMFASecret(plainSecret: string): string {
  const key = getCipherKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plainSecret, "utf8"),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export function decryptMFASecret(encryptedBlob: string): string {
  const key = getCipherKey()
  const data = Buffer.from(encryptedBlob, "base64")
  const iv = data.subarray(0, 16)
  const tag = data.subarray(16, 32)
  const encrypted = data.subarray(32)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final("utf8")
}