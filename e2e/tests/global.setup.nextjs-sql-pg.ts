import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import * as fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import * as path from 'node:path';
import { test as setup } from '@playwright/test';
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { GenericContainer, Wait } from 'testcontainers';

const PROJECT = 'nextjs-sql-pg';
const PORT = 3002;
const HOST = '127.0.0.1';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function migrateToLatest(kysely: Kysely<any>) {
  const migrationFolder = path.join(
    process.cwd(),
    'packages/better-blog/src/providers/__tests__/migrations/postgres'
  );
  const migrator = new Migrator({
    db: kysely,
    provider: new FileMigrationProvider({ fs, path, migrationFolder }),
    migrationTableName: 'blog_migrations',
    migrationLockTableName: 'blog_migrations_lock',
  });
  const { error } = await migrator.migrateToLatest();
  if (error) throw error;
}

async function waitForPg(connectionString: string, timeoutMs = 60000) {
  const start = Date.now();
  // Try light connections until it succeeds or timeout
  while (Date.now() - start < timeoutMs) {
    let pool: Pool | null = null;
    try {
      pool = new Pool({ connectionString });
      const client = await pool.connect();
      await client.query('select 1');
      client.release();
      await pool.end();
      return; // ready
    } catch {
      try { await pool?.end(); } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Postgres not ready after ${timeoutMs}ms`);
}

setup('start postgres, migrate, write env, start nextjs (sql)', async () => {
  const container = await new GenericContainer('postgres:16')
    .withEnvironment({ POSTGRES_PASSWORD: 'pw', POSTGRES_USER: 'user', POSTGRES_DB: 'better_blog' })
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const DATABASE_URL = `postgres://user:pw@${host}:${port}/better_blog`;

  // Ensure DB is truly ready before performing schema operations
  await waitForPg(DATABASE_URL, 60000);

  const pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  const db = new Kysely({ dialect: new PostgresDialect({ pool }) });

  // Reset schema and migrate
  await sql`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`.execute(db);
  await migrateToLatest(db);
  await db.destroy();

  const envPath = join('.e2e', `${PROJECT}.env`);
  await mkdir(dirname(envPath), { recursive: true });
  const envContents = [
    'E2E=1',
    'BETTER_BLOG_PROVIDER=sql',
    'SQL_DIALECT=postgres',
    `DATABASE_URL=${DATABASE_URL}`,
    `TESTCONTAINERS_CONTAINER_ID=${container.getId()}`,
  ].join('\n');
  await writeFile(envPath, envContents, 'utf8');

  const metaPath = join('.e2e', `${PROJECT}.json`);
  await writeFile(metaPath, JSON.stringify({ containerId: container.getId() }), 'utf8');

  // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
  const proc = spawn('node', ['e2e/scripts/run-webserver.mjs', `--framework=nextjs`, `--project=${PROJECT}`, `--port=${PORT}`, `--script=start:e2e`], {
    stdio: 'ignore',
    detached: true,
    env: process.env,
  });
  proc.unref();

  // append serverPid to meta
  await writeFile(metaPath, JSON.stringify({ containerId: container.getId(), serverPid: proc.pid }), 'utf8');

  // Wait for HTTP readiness
  const start = Date.now();
  while (Date.now() - start < 60000) {
    try {
      const res = await fetch(`http://${HOST}:${PORT}/posts`);
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  // One last attempt to confirm
  const confirm = await fetch(`http://${HOST}:${PORT}/posts`).catch(() => null);
  if (!confirm || !confirm.ok) throw new Error(`Next.js server not ready at http://${HOST}:${PORT}/posts`);
});


