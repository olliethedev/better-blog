import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test as teardown } from '@playwright/test';
import Docker from 'dockerode';

const PROJECT = 'nextjs-sql-pg';

teardown('stop postgres container', async () => {
  try {
    const metaPath = join('.e2e', `${PROJECT}.json`);
    const metaRaw = await readFile(metaPath, 'utf8');
    const { containerId } = JSON.parse(metaRaw) as { containerId: string };
    const docker = new Docker();
    const container = docker.getContainer(containerId);
    try {
      await container.stop();
    } catch {}
    try {
      await container.remove({ force: true });
    } catch {}
  } catch {}
});


