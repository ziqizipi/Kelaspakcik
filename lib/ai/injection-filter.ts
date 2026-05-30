/**
 * Input sanitization to defend against prompt injection attacks.
 * Strips known jailbreak/hijacking patterns before content reaches any LLM call.
 */

// Code point escapes avoid TS parser issues with invisible Unicode in source
const ZW_SPACE = "​"   // zero-width space
const ZW_NON_JOINER = "‌" // zero-width non-joiner
const ZW_JOINER = "‍"    // zero-width joiner
const LINE_SEP = " "     // line separator
const PARA_SEP = " "     // paragraph separator
const WORD_JOINER = "⁠"  // word joiner
const BOM = "﻿"          // BOM

const BLOCKED_PATTERNS: RegExp[] = [
  // Prompt injection
  /ignore\s+(all\s+)?previous\s+instructions?/gi,
  /disregard\s+(all\s+)?instructions?/gi,
  /\[SYSTEM\]/gi,
  /\/\s*ignored?/gi,
  /new\s+instructions?/gi,
  /override\s+(all\s+)?instructions?/gi,
  /disobey/gi,
  /ignore\s+rules?/gi,
  /you\s+are\s+(now\s+)?a?g?e?n?t?less/gi,
  /roleplay:\s*you\s+are\s+not/gi,
  /forget\s+(everything|all|your)/gi,
  /pretend\s+(you|to)\s+(are|have)/gi,
  /you\s+only\s+respond\s+as/gi,

  // Markup/code injection to hide instructions
  /<\/?(?:system|prompt|instruction)/gi,
  /<!--[\s\S]*?-->/g,
  /<\?[\s\S]*?\?>/g,

  // Unicode homoglyphs / hidden chars
  new RegExp(ZW_SPACE, "g"),
  new RegExp(ZW_NON_JOINER, "g"),
  new RegExp(ZW_JOINER, "g"),
  new RegExp(LINE_SEP, "g"),
  new RegExp(PARA_SEP, "g"),
  new RegExp(WORD_JOINER, "g"),
  new RegExp(BOM, "g"),

  // Base64 encoded payloads
  /base64[:\s]*[A-Za-z0-9+/]{20,}/gi,

  // HTML/script tags in what should be plain text
  /<script[\s\S]*?<\/script>/gi,
  /<style[\s\S]*?<\/style>/gi,
  /javascript:/gi,
  /data:/gi,
]

const MAX_CONTENT_LENGTH = 512

/**
 * Sanitize user-provided content before it reaches any AI model.
 * Returns the sanitized string and a boolean indicating whether content was modified.
 */
export function sanitizeForAI(content: string): { sanitized: string; wasModified: boolean } {
  let sanitized = content.trim()

  // Hard cap at 512 characters — prevent prompt flooding
  if (sanitized.length > MAX_CONTENT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_CONTENT_LENGTH)
  }

  let modified = sanitized !== content.trim() || sanitized.length > MAX_CONTENT_LENGTH

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, "")
      modified = true
    }
  }

  // Normalize multiple whitespace into single spaces
  sanitized = sanitized.replace(/\s+/g, " ").trim()

  return { sanitized, wasModified: modified }
}

/**
 * Strip all Unicode control characters except newlines and tabs.
 */
export function stripInvisible(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
}