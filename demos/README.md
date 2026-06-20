# WORLDLINE Playable Demo Forks

Local open-source HTML5 game forks adapted to demonstrate WORLDLINE across non-RPG genres.

## Launcher

- Build Bubble Gun: `npm run demo:bubble:build`
- Build You're the OS: `npm run demo:os:build`
- Serve both playable demos: `npm run demo:playable`
- Open: `http://127.0.0.1:5190/`

## Bubble Gun

- Source: https://github.com/remarkablegames/bubble-gun
- Local fork: `demos/forks/bubble-gun`
- License: MIT
- Genre: arcade survival / top-down shooter
- Status: playable WORLDLINE fork
- Run: `npm run demo:bubble`
- Build check: `npm run demo:bubble:build`

WORLDLINE hooks added:

- `src/worldline.ts` stores a browser-local WORLDLINE state object with actor, canon, and event log.
- Score events emit `bubble.enemy_captured` memories.
- Run starts emit `bubble.run_started`.
- Player death emits `bubble.run_ended`.
- Title and game scenes read the remembered canon and display a briefing that changes across runs.

This proves the demo story is not RPG-bound: an arcade game can write pressure, discipline, and risk signals into the same cross-game memory layer.

## You're the OS!

- Source: https://github.com/plbrault/youre-the-os
- Local fork: `demos/forks/youre-the-os`
- License: GPLv3-or-later
- Genre: systems / scheduling simulation
- Status: playable WORLDLINE fork
- Build check: `npm run demo:os:build`
- Run standalone Pygbag server: `npm run demo:os`

WORLDLINE hooks added:

- `src/worldline.py` stores actor, canon, and event log state.
- Stage start/end emits `os.run_started` and `os.run_ended`.
- Score updates emit process completion, forced termination, and wasted I/O memories.
- The stage renders a three-line WORLDLINE briefing so the sim is visibly adapted.

Notes:

- It is Python/Pygbag rather than TypeScript/Vite, so it uses a local `.venv`.
- Because it is GPLv3, keep its adapted source and notices isolated from permissive SDK examples.
