/**
 * Secure Server Logger for Akwaba Chat
 * Sanitizes all output to prevent exposing API keys, tokens, or sensitive payload data.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9_\-\.]+/gi,
  /sk-[A-Za-z0-9_\-\.]+/gi,
  /key=[A-Za-z0-9_\-\.]+/gi,
  /"apiKey":\s*"[^"]+"/gi,
  /"password":\s*"[^"]+"/gi,
  /"token":\s*"[^"]+"/gi,
];

function sanitize(message: string): string {
  let cleaned = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[REDACTED_SECRET]");
  }
  return cleaned;
}

function formatLog(level: LogLevel, context: string, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const sanitizedMessage = sanitize(message);

  let sanitizedData: Record<string, unknown> | undefined = undefined;
  if (data) {
    try {
      const jsonStr = sanitize(JSON.stringify(data));
      sanitizedData = JSON.parse(jsonStr);
    } catch {
      sanitizedData = { note: "[Unserializable Data]" };
    }
  }

  const output = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${sanitizedMessage} ${
    sanitizedData ? JSON.stringify(sanitizedData) : ""
  }`;

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(output);
      }
      break;
    case "info":
    default:
      console.log(output);
      break;
  }
}

export const logger = {
  info: (context: string, message: string, data?: Record<string, unknown>) =>
    formatLog("info", context, message, data),
  warn: (context: string, message: string, data?: Record<string, unknown>) =>
    formatLog("warn", context, message, data),
  error: (context: string, message: string, data?: Record<string, unknown>) =>
    formatLog("error", context, message, data),
  debug: (context: string, message: string, data?: Record<string, unknown>) =>
    formatLog("debug", context, message, data),
};
