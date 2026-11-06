/**
 * BharatCode OpenAI-compatible chat client.
 *
 * Base URL: https://bharatcode.ai/api/model/v1
 * Model: qwen-3.8-27b (262k context) — GET /models verified live
 * (qwen-3.8-27b, status "live") on 2026-11-06.
 * POST /chat/completions returned HTTP 500 "internal_error" on repeated
 * attempts during verification (the known intermittent failure mode) —
 * hence: exponential backoff (3 attempts) + deterministic template fallback.
 * The API key is server-side ONLY (BHARATCODE_API_KEY in .env, never
 * committed, never sent to the browser).
 */

export const BHARATCODE_BASE_URL =
  process.env.BHARATCODE_BASE_URL ?? "https://bharatcode.ai/api/model/v1";
export const BHARATCODE_MODEL =
  process.env.BHARATCODE_MODEL ?? "qwen-3.8-27b";

export interface LlmResult {
  text: string | null;
  source: "bharatcode" | "template-fallback";
  attempts: number;
  model: string;
  modelStatusNote: string;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function bharatCodeChat(
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<LlmResult> {
  const key = process.env.BHARATCODE_API_KEY;
  const model = BHARATCODE_MODEL;
  if (!key) {
    return {
      text: null,
      source: "template-fallback",
      attempts: 0,
      model,
      modelStatusNote: "BHARATCODE_API_KEY not set on server; template fallback used.",
    };
  }
  const maxAttempts = 3;
  let lastError = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${BHARATCODE_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          temperature: opts.temperature ?? 0,
          max_tokens: opts.maxTokens ?? 1800,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        lastError = `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`;
      } else {
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = json.choices?.[0]?.message?.content?.trim();
        if (text) {
          return {
            text,
            source: "bharatcode",
            attempts: attempt,
            model,
            modelStatusNote: `Live: ${model} on ${BHARATCODE_BASE_URL} (attempt ${attempt}).`,
          };
        }
        lastError = "Empty completion";
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
    if (attempt < maxAttempts) {
      await sleep(1200 * 2 ** (attempt - 1)); // 1.2s, 2.4s backoff
    }
  }
  return {
    text: null,
    source: "template-fallback",
    attempts: maxAttempts,
    model,
    modelStatusNote: `BharatCode unreachable after ${maxAttempts} attempts (${lastError}). Using deterministic template fallback; demo never dies.`,
  };
}
