#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

function parseArgs(argv) {
  const args = {};
  for (const a of argv) {
    const [k, v] = a.split('=');
    if (k && v !== undefined) args[k.replace(/^--/, '')] = v;
  }
  return args;
}

const { framework, project, port } = parseArgs(process.argv.slice(2));
if (!framework || !project || !port) {
  console.error('Usage: run-webserver.mjs --framework=<nextjs> --project=<name> --port=<number>');
  process.exit(2);
}

// Load env file
try {
  const envText = await readFile(`.e2e/${project}.env`, 'utf8');
  for (const line of envText.split('\n')) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx);
    const value = line.slice(idx + 1);
    process.env[key] = value;
  }
} catch {}

process.env.PORT = String(port);
process.env.E2E = process.env.E2E || '1';

const startCmd = ["pnpm", ["--dir", `apps/examples/${framework}`, "start"]]

const proc = spawn(startCmd[0], startCmd[1], { stdio: 'inherit', env: process.env });
proc.on('exit', (code) => process.exit(code ?? 1));


