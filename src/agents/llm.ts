/**
 * Minimal provider-agnostic LLM interface for the reasoning seams. Dependency-free
 * (uses fetch). One OpenAI-compatible impl is provided; a Claude-backed impl would
 * wrap the Anthropic Messages API (model e.g. "claude-sonnet-4-6") behind the same
 * interface.
 */
export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLM {
  complete(messages: LLMMessage[], opts?: { maxTokens?: number; temperature?: number }): Promise<string>;
}

export class OpenAICompatLLM implements LLM {
  #baseUrl: string;
  #apiKey: string;
  #model: string;

  constructor(cfg: { baseUrl: string; apiKey: string; model: string }) {
    this.#baseUrl = cfg.baseUrl.replace(/\/$/, "");
    this.#apiKey = cfg.apiKey;
    this.#model = cfg.model;
  }

  async complete(messages: LLMMessage[], opts: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
    const res = await fetch(`${this.#baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.#apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.#model,
        messages,
        max_tokens: opts.maxTokens ?? 600,
        temperature: opts.temperature ?? 0.5,
      }),
    });
    if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const body: any = await res.json();
    return body?.choices?.[0]?.message?.content ?? "";
  }
}

/** Pull the first JSON object/array out of an LLM reply (tolerates ```json fences + prose). */
export function extractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error(`no JSON in LLM reply: ${text.slice(0, 120)}`);
  const open = candidate[start]!;
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === open) depth++;
    else if (candidate[i] === close && --depth === 0) {
      return JSON.parse(candidate.slice(start, i + 1));
    }
  }
  throw new Error(`unbalanced JSON in LLM reply`);
}
