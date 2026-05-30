/**
 * Gemini wrapper using Google Vertex AI.
 * Provides circuit-breaker logic to prevent cascading failures.
 */

interface GenerateOptions {
  prompt: string
  signal?: AbortSignal
}

interface GenerateResult {
  response?: {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }
}

// Simple in-memory circuit breaker
const circuitBreaker = new Map<string, { failures: number; lastFailure: number }>()
const CIRCUIT_FAILURE_LIMIT = 5
const CIRCUIT_RESET_MS = 60_000

function isCircuitOpen(modelName: string): boolean {
  const state = circuitBreaker.get(modelName)
  if (!state) return false
  if (Date.now() - state.lastFailure > CIRCUIT_RESET_MS) {
    circuitBreaker.delete(modelName)
    return false
  }
  return state.failures >= CIRCUIT_FAILURE_LIMIT
}

async function recordFailure(modelName: string) {
  const existing = circuitBreaker.get(modelName) ?? { failures: 0, lastFailure: 0 }
  circuitBreaker.set(modelName, {
    failures: existing.failures + 1,
    lastFailure: Date.now(),
  })
}

async function recordSuccess(modelName: string) {
  circuitBreaker.delete(modelName)
}

export async function generateWithCircuitBreaker(
  prompt: string,
  options?: GenerateOptions
): Promise<GenerateResult> {
  if (isCircuitOpen("gemini")) {
    throw new Error("AI service temporarily unavailable (circuit open)")
  }

  try {
    const { VertexAI } = await import("@google-cloud/vertexai")

    const vertexai = new VertexAI({
      project: process.env.GCP_PROJECT_ID || process.env.GEMINI_PROJECT || "balas-ai",
      location: process.env.GCP_LOCATION || "asia-southeast1",
    })

    const model = vertexai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: "Kamu adalah AI helper untuk platform customer service WhatsApp." }],
      },
    })

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      ...(options?.signal ? { signal: options.signal } : {}),
    })

    await recordSuccess("gemini")
    return result as GenerateResult
  } catch (error) {
    await recordFailure("gemini")
    throw error
  }
}
