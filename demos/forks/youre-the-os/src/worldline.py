"""You're the OS → WORLDLINE adapter.

Talks to the local WORLDLINE proxy (Walrus + Sui pointer + MemWal recall) over
HTTP, instead of writing JSON to disk. Same `WorldlineStore` interface as
before so `stage.py` doesn't change.

Writes are async on the proxy side (durable storage is slow); reads are
near-instant via the proxy's cached canon. If the proxy is unreachable, the
store degrades gracefully — events drop and briefings show 'Offline'.
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request

_DEFAULT_PROXY = os.environ.get('WORLDLINE_PROXY', 'http://127.0.0.1:5195')
_ACTOR = 'soul:browser-player-001'
_SOURCE = 'youre-the-os'


def _post_event(proxy, type_, payload, memo):
    body = json.dumps({
        'actor': _ACTOR,
        'source': _SOURCE,
        'type': type_,
        'payload': payload,
        'memo': memo,
    }).encode('utf-8')
    req = urllib.request.Request(
        f'{proxy}/event',
        data=body,
        method='POST',
        headers={'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req, timeout=2.5) as r:
            r.read()
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f'[worldline] emit dropped (offline): {exc}', flush=True)


def _get_json(proxy, path):
    try:
        with urllib.request.urlopen(f'{proxy}{path}', timeout=2.5) as r:
            return json.loads(r.read().decode('utf-8'))
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError):
        return None


class WorldlineStore:
    def __init__(self, proxy=None):
        self._proxy = proxy or _DEFAULT_PROXY
        self._briefing = None

    # ── reads ──────────────────────────────────────────────────────────────

    def snapshot(self):
        canon = _get_json(self._proxy, f'/canon/{urllib.parse.quote(_ACTOR)}')
        return {
            'actor': _ACTOR,
            'canon': (canon or {}).get('canon') or {},
            'events': [],
        }

    def briefing_lines(self):
        if self._briefing is not None:
            return self._briefing
        out = _get_json(self._proxy, f'/briefing/{urllib.parse.quote(_ACTOR)}')
        self._briefing = (out or {}).get('lines') or [
            'WORLDLINE',
            'Offline',
            'Run the proxy: npm run demo:proxy',
        ]
        return self._briefing

    def refresh_briefing(self):
        """Force a fresh briefing fetch — call after a run ends so the next title shows new state."""
        self._briefing = None
        return self.briefing_lines()

    # ── writes ─────────────────────────────────────────────────────────────

    def record_run_start(self, stage_name):
        _post_event(
            self._proxy,
            'os.run_started',
            {
                'stage': stage_name,
                'canon': {
                    'standings': {'runs': 1},
                    'flags': {'last_source': 'youre-the-os'},
                },
            },
            f'Entered {stage_name} in youre-the-os.',
        )

    def record_score_tick(self, *, score, graceful_delta, user_delta, wasted_io_delta):
        if graceful_delta == 0 and user_delta == 0 and wasted_io_delta == 0:
            return
        canon = {
            'standings': {
                'discipline': graceful_delta * 4,
                'panic': user_delta * 5 + wasted_io_delta * 2,
                'best_score': score,
            },
        }
        if graceful_delta:
            _post_event(
                self._proxy,
                'os.process_completed',
                {'score': score, 'count': graceful_delta, 'canon': canon},
                f'Completed {graceful_delta} process(es) cleanly at score {score}.',
            )
        if user_delta:
            _post_event(
                self._proxy,
                'os.process_terminated',
                {'score': score, 'count': user_delta},
                f'Force-terminated {user_delta} process(es) at score {score}.',
            )
        if wasted_io_delta:
            _post_event(
                self._proxy,
                'os.io_wasted',
                {'score': score, 'count': wasted_io_delta},
                f'Wasted {wasted_io_delta} I/O at score {score}.',
            )

    def record_run_end(self, *, stage_name, score, outcome):
        canon = {
            'standings': {
                'best_score': score,
                'panic': 6 if outcome == 'defeat' else -3,
                'discipline': 4 if outcome == 'victory' else 0,
            },
            'flags': {
                'last_outcome': outcome,
                'last_source': 'youre-the-os',
            },
        }
        _post_event(
            self._proxy,
            'os.run_ended',
            {'stage': stage_name, 'score': score, 'outcome': outcome, 'canon': canon},
            f'Run ended ({outcome}) at score {score} in {stage_name}.',
        )
        # next title visit should show fresh state
        self.refresh_briefing()
