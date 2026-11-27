/**
 * Proveedores LLM con capa gratuita, invocados vía REST (fetch nativo de Node 18+),
 * sin SDKs adicionales.
 *  - gemini:     Google AI Studio (capa gratuita sin tarjeta). Recomendado.
 *  - groq:       Groq Cloud, API compatible con OpenAI (gpt-oss-120b). Respaldo muy rápido.
 *  - openrouter: OpenRouter, modelos ":free". Respaldo adicional.
 */
export interface LlmRequest {
  system: string;
  user: string;
  temperature?: number;
}

export interface LlmProvider {
  readonly name: string;
  readonly model: string;
  complete(req: LlmRequest): Promise<string>;
}

export class LlmProviderError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

async function fetchJson(
  provider: string,
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text();
    if (!res.ok) {
      let detail = text.slice(0, 300);
      try {
        const parsed = JSON.parse(text);
        detail = parsed?.error?.message || parsed?.message || detail;
      } catch {
        /* cuerpo no JSON */
      }
      const hint = res.status === 429 ? ' (límite de la capa gratuita alcanzado)' : '';
      throw new LlmProviderError(`HTTP ${res.status}${hint}: ${detail}`, provider, res.status);
    }
    return text ? JSON.parse(text) : {};
  } catch (err) {
    if (err instanceof LlmProviderError) throw err;
    if ((err as Error).name === 'AbortError') {
      throw new LlmProviderError(`Tiempo de espera agotado (${timeoutMs} ms)`, provider);
    }
    throw new LlmProviderError(`Error de red: ${(err as Error).message}`, provider);
  } finally {
    clearTimeout(timer);
  }
}

export class GeminiProvider implements LlmProvider {
  readonly name = 'gemini';

  constructor(
    private readonly apiKey: string,
    readonly model: string,
    private readonly timeoutMs: number,
  ) {}

  async complete(req: LlmRequest): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;
    const data = await fetchJson(
      this.name,
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: req.system }] },
          contents: [{ role: 'user', parts: [{ text: req.user }] }],
          generationConfig: {
            temperature: req.temperature ?? 0.3,
            responseMimeType: 'application/json',
          },
        }),
      },
      this.timeoutMs,
    );
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((p: { text?: string }) => p.text || '')
      .join('');
    if (!text.trim()) {
      const reason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason || 'sin contenido';
      throw new LlmProviderError(`Respuesta vacía (${reason})`, this.name);
    }
    return text;
  }
}

export class OpenAiCompatibleProvider implements LlmProvider {
  constructor(
    readonly name: string,
    private readonly baseUrl: string,
    private readonly apiKey: string,
    readonly model: string,
    private readonly timeoutMs: number,
    private readonly extraHeaders: Record<string, string> = {},
  ) {}

  async complete(req: LlmRequest): Promise<string> {
    const data = await fetchJson(
      this.name,
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          ...this.extraHeaders,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: req.temperature ?? 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: req.system },
            { role: 'user', content: req.user },
          ],
        }),
      },
      this.timeoutMs,
    );
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text.trim()) throw new LlmProviderError('Respuesta vacía', this.name);
    return text;
  }
}

export interface ProviderEnv {
  get(key: string): string | undefined;
}

export const DEFAULT_MODELS: Record<string, string> = {
  gemini: 'gemini-2.5-flash',
  groq: 'openai/gpt-oss-120b',
  openrouter: 'google/gemma-4-31b-it:free',
};

/** Crea un proveedor si su API key está configurada; devuelve null en caso contrario */
export function createProvider(name: string, env: ProviderEnv): LlmProvider | null {
  const timeout = parseInt(env.get('AI_TIMEOUT_MS') || '30000', 10);
  switch (name) {
    case 'gemini': {
      const key = env.get('GEMINI_API_KEY')?.trim();
      return key ? new GeminiProvider(key, env.get('GEMINI_MODEL')?.trim() || DEFAULT_MODELS.gemini, timeout) : null;
    }
    case 'groq': {
      const key = env.get('GROQ_API_KEY')?.trim();
      return key
        ? new OpenAiCompatibleProvider('groq', 'https://api.groq.com/openai/v1', key, env.get('GROQ_MODEL')?.trim() || DEFAULT_MODELS.groq, timeout)
        : null;
    }
    case 'openrouter': {
      const key = env.get('OPENROUTER_API_KEY')?.trim();
      return key
        ? new OpenAiCompatibleProvider(
            'openrouter',
            'https://openrouter.ai/api/v1',
            key,
            env.get('OPENROUTER_MODEL')?.trim() || DEFAULT_MODELS.openrouter,
            timeout,
            { 'X-Title': 'Usability Test Dashboard IHC' },
          )
        : null;
    }
    default:
      return null;
  }
}
