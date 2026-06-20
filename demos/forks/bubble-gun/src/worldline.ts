/**
 * Bubble Gun → WORLDLINE adapter. Talks to the live proxy (Walrus + Sui pointer
 * + MemWal recall) so events become durable, cross-game, verifiable canon — not
 * a localStorage trick. The proxy holds the keys and absorbs the 20-30s write
 * latency off the play loop.
 *
 * Endpoints: POST /event · GET /canon/:actor · GET /briefing/:actor
 */
const PROXY = (import.meta.env?.VITE_WORLDLINE_PROXY as string | undefined) ?? 'http://127.0.0.1:5195'
const ACTOR = 'soul:browser-player-001'
const SOURCE = 'bubble-gun'

type Canon = {
  standings: Record<string, number>
  flags: Record<string, string | boolean>
}

let briefingCache: string[] | null = null

async function emit(type: string, payload: Record<string, unknown>, memo: string): Promise<void> {
  try {
    await fetch(`${PROXY}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: ACTOR, source: SOURCE, type, payload, memo }),
      keepalive: true,
    })
  } catch (e) {
    console.warn('[worldline] emit failed (offline):', (e as Error).message)
  }
}

async function fetchCanon(): Promise<Canon | null> {
  try {
    const res = await fetch(`${PROXY}/canon/${encodeURIComponent(ACTOR)}`)
    if (!res.ok) return null
    const json = (await res.json()) as { canon: Canon }
    return json.canon ?? null
  } catch {
    return null
  }
}

async function fetchBriefingLines(): Promise<string[]> {
  try {
    const res = await fetch(`${PROXY}/briefing/${encodeURIComponent(ACTOR)}`)
    if (!res.ok) return ['WORLDLINE', 'Offline', 'Run the proxy: npm run demo:proxy']
    const json = (await res.json()) as { lines: string[] }
    return json.lines
  } catch {
    return ['WORLDLINE', 'Offline', 'Run the proxy: npm run demo:proxy']
  }
}

/** Title-screen briefing — synchronous getter backed by a primed cache. */
export function worldlineBriefing(): string {
  return (briefingCache ?? ['WORLDLINE', '…', '']).join('\n')
}

/** Prime the briefing once at startup (e.g. on title scene mount). */
export async function primeWorldlineBriefing(): Promise<void> {
  briefingCache = await fetchBriefingLines()
  window.dispatchEvent(new CustomEvent('worldline:briefing', { detail: briefingCache }))
}

/** Fresh canon snapshot for the post-run summary. */
export async function worldlineSnapshot(): Promise<Canon | null> {
  return fetchCanon()
}

export function recordBubbleScore(score: number): void {
  // a scored bubble => tick discipline + risk along the survival pressure axis
  void emit(
    'bubble.score',
    { score, delta: { canon: { standings: { discipline: 1, risk: 1 } } } },
    `Player scored ${score} in bubble-gun`,
  )
}

export function recordBubbleRunStart(): void {
  void emit(
    'bubble.run_started',
    { canon: { standings: { runs: 1 }, flags: { last_source: 'bubble-gun' } } },
    'New run started in bubble-gun',
  )
}

export function recordBubbleRunEnd(score: number): void {
  // panic spikes if score was low; discipline rises if it was high
  const pressure = score < 50 ? 8 : -4
  const discipline = score >= 50 ? 6 : 0
  void emit(
    'bubble.run_ended',
    {
      score,
      canon: {
        standings: { survival_pressure: pressure, discipline, best_score: score },
        flags: { last_outcome: score >= 50 ? 'victory' : 'defeat', last_source: 'bubble-gun' },
      },
    },
    `Run ended with score ${score} in bubble-gun`,
  )
  // refresh briefing for the next title visit
  void primeWorldlineBriefing()
}
