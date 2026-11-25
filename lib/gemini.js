import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Stable, vision-capable model used for car image analysis.
 * Override with GEMINI_MODEL in .env if needed.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Fallback chain: if the primary model is overloaded (503) or rate-limited,
 * try the next model instead of failing the whole request.
 */
export const GEMINI_FALLBACK_MODELS = ["gemini-3.5-flash-lite"];

const RETRYABLE_STATUS = /\[(429|500|502|503|504)\]/;
const RETRYABLE_NETWORK =
  /failed to fetch|fetch failed|network error|ECONNRESET|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN|ENOTFOUND|socket hang up/i;
const MAX_ATTEMPTS = 3;

// The SDK has no default timeout, so an overloaded model can hang the request
// indefinitely. Abort each attempt and move on to the next model instead.
// Kept short: a healthy model answers in ~1-2s, so 15s means it is stuck.
const REQUEST_TIMEOUT_MS = 15_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Run generateContent on a multimodal prompt, retrying transient
 * rate-limit / service-unavailable errors with exponential backoff.
 */
export async function generateContentWithRetry(parts) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Primary model first, then any distinct fallbacks.
  const models = [...new Set([GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS])];

  let lastError;

  for (const modelName of models) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const result = await model.generateContent(parts, {
          timeout: REQUEST_TIMEOUT_MS,
        });
        return result.response.text();
      } catch (error) {
        lastError = error;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // A timeout is transient too — treat it like a 503. The SDK wraps the
        // AbortError in a plain GoogleGenerativeAIError, so match the message.
        const timedOut = /abort/i.test(errorMessage);
        const networkFailure = RETRYABLE_NETWORK.test(errorMessage);

        // Only retry transient failures; a 400 means the request itself is wrong.
        // A 404 (model retired/renamed) is not retryable, but it should still
        // fall through to the next model in the chain.
        if (!timedOut && !networkFailure && !RETRYABLE_STATUS.test(errorMessage)) {
          if (/\[404\b/.test(errorMessage)) break;
          throw error;
        }

        if (attempt < MAX_ATTEMPTS) {
          await sleep(500 * 2 ** (attempt - 1));
        }
      }
    }

    // This model stayed unavailable after retries — fall through to the next one.
  }

  throw lastError;
}

/**
 * Strip markdown code fences around a JSON response and parse it.
 */
export function parseJsonResponse(text) {
  const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleaned);
}
