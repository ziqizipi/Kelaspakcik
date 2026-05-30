/**
 * Simple structured logger.
 * Logs JSON to stdout in development, sent to stdout in production.
 */
type LogLevel = "info" | "warn" | "error"

function format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  }
  return JSON.stringify(entry)
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(format("info", message, meta))
  },
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(format("warn", message, meta))
  },
  error(message: string, meta?: Record<string, unknown>) {
    console.error(format("error", message, meta))
  },
}
