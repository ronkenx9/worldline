import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(new URL('.', import.meta.url).pathname);
const bubbleRoot = join(root, 'forks/bubble-gun/dist');
const osRoot = join(root, 'forks/youre-the-os/src/build/web');
const inspectorFile = join(root, 'inspector.html');
const port = Number(process.env.PORT ?? 5190);

const contentTypes = {
  '.apk': 'application/octet-stream',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
};

function launcher() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WORLDLINE Playable Demos</title>
    <style>
      :root {
        color: #f1eee7;
        background: #080808;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body { margin: 0; min-height: 100vh; background: #080808; }
      main { max-width: 1180px; margin: 0 auto; padding: 44px 22px 60px; }
      h1 { margin: 0 0 12px; font-size: clamp(42px, 7vw, 96px); line-height: .9; letter-spacing: 0; }
      p { max-width: 720px; color: #bcb7aa; font-size: 18px; line-height: 1.55; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 18px; margin-top: 34px; }
      article { border: 1px solid #37342d; background: #151515; display: flex; flex-direction: column; }
      .inspector { grid-column: 1 / -1; }
      .inspector iframe { height: 720px; }
      .meta { padding: 18px; border-bottom: 1px solid #37342d; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
      h2 { margin: 0; font-size: 22px; }
      .tag { font-family: ui-monospace, "JetBrains Mono", monospace; font-size: 10px; letter-spacing: 0.2em; color: #8d887d; text-transform: uppercase; }
      a { color: #080808; background: #f3e66d; padding: 10px 14px; text-decoration: none; font-weight: 800; }
      iframe { width: 100%; height: 620px; border: 0; background: #111; flex: 1; }
      .note { font-size: 13px; color: #8d887d; margin-top: 28px; }
      @media (max-width: 900px) {
        .grid { grid-template-columns: 1fr; }
        iframe { height: 560px; }
        .inspector iframe { height: 720px; }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>WORLDLINE<br />Playable Demos</h1>
      <p>Two open-source browser games adapted to emit WORLDLINE-style memory: arcade pressure from Bubble Gun, and operating-system scheduling behavior from You're the OS. Both write to the same canon. The inspector below shows the live Walrus + Sui state — receipts, not vibes.</p>
      <section class="grid">
        <article>
          <div class="meta">
            <h2>Bubble Gun <span class="tag">arcade survival</span></h2>
            <a href="/bubble/" target="_blank" rel="noreferrer">Open</a>
          </div>
          <iframe title="Bubble Gun WORLDLINE demo" src="/bubble/"></iframe>
        </article>
        <article>
          <div class="meta">
            <h2>You're the OS <span class="tag">systems sim</span></h2>
            <a href="/os/" target="_blank" rel="noreferrer">Open</a>
          </div>
          <iframe title="You're the OS WORLDLINE demo" src="/os/"></iframe>
        </article>
        <article class="inspector">
          <div class="meta">
            <h2>Inspector <span class="tag">live canon · Walrus + Sui</span></h2>
            <a href="/inspector" target="_blank" rel="noreferrer">Open</a>
          </div>
          <iframe title="WORLDLINE inspector" src="/inspector"></iframe>
        </article>
      </section>
      <p class="note">Local demo server. Bubble Gun is MIT. You're the OS is GPLv3-or-later and kept isolated in its fork. Inspector polls the proxy at <span class="tag">127.0.0.1:5195</span>.</p>
    </main>
  </body>
</html>`;
}

function safePath(base, pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = normalize(decoded).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  const candidate = join(base, relative || 'index.html');
  const resolvedBase = resolve(base);
  const resolvedCandidate = resolve(candidate);
  if (!resolvedCandidate.startsWith(resolvedBase)) return null;
  if (existsSync(resolvedCandidate) && statSync(resolvedCandidate).isDirectory()) {
    return join(resolvedCandidate, 'index.html');
  }
  return resolvedCandidate;
}

function sendFile(response, path) {
  if (!path || !existsSync(path) || !statSync(path).isFile()) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const fileStat = statSync(path);
  response.writeHead(200, {
    'content-type': contentTypes[extname(path)] ?? 'application/octet-stream',
    'content-length': fileStat.size,
    'cache-control': 'no-store',
  });
  createReadStream(path).pipe(response);
}

function route(request, response) {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (url.pathname === '/') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(launcher());
    return;
  }

  if (url.pathname === '/inspector' || url.pathname === '/inspector/') {
    sendFile(response, inspectorFile);
    return;
  }

  if (url.pathname.startsWith('/bubble/')) {
    sendFile(response, safePath(bubbleRoot, url.pathname.slice('/bubble/'.length)));
    return;
  }

  if (url.pathname.startsWith('/os/')) {
    sendFile(response, safePath(osRoot, url.pathname.slice('/os/'.length)));
    return;
  }

  const bubbleAbsoluteAssetRoots = ['assets', 'backgrounds', 'images', 'music', 'sounds', 'sprites'];
  const firstSegment = url.pathname.split('/').filter(Boolean)[0];
  if (bubbleAbsoluteAssetRoots.includes(firstSegment) || url.pathname === '/logo.png' || url.pathname === '/manifest.json') {
    sendFile(response, safePath(bubbleRoot, url.pathname));
    return;
  }

  sendFile(response, safePath(osRoot, url.pathname.slice(1)));
}

createServer(route).listen(port, '127.0.0.1', () => {
  console.log(`WORLDLINE playable demos: http://127.0.0.1:${port}/`);
});
