import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { test as setup } from '@playwright/test';

const PROJECT = 'nextjs-memory';
const PORT = 3001;
const HOST = '127.0.0.1';

async function waitForReady(url: string, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not become ready in ${timeoutMs}ms`);
}

setup('write env and start nextjs (memory)', async () => {
  const envPath = join('.e2e', `${PROJECT}.env`);
  await mkdir(dirname(envPath), { recursive: true });
  const contents = ['E2E=1', 'BETTER_BLOG_PROVIDER=memory'].join('\n');
  await writeFile(envPath, contents, 'utf8');

  // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
  const proc = spawn('node', ['e2e/scripts/run-webserver.mjs', `--framework=nextjs`, `--project=${PROJECT}`, `--port=${PORT}`, `--script=start:e2e`], {
    stdio: 'ignore',
    detached: true,
    env: process.env,
  });
  proc.unref();

  const metaPath = join('.e2e', `${PROJECT}.json`);
  await writeFile(metaPath, JSON.stringify({ serverPid: proc.pid }), 'utf8');

  await waitForReady(`http://${HOST}:${PORT}/posts`);
});


