import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test as teardown } from '@playwright/test';

const PROJECT = 'react-api';

teardown('cleanup react api server', async () => {
  try {
    const metaPath = join('.e2e', `${PROJECT}.json`);
    const metaRaw = await readFile(metaPath, 'utf8');
    const { serverPid } = JSON.parse(metaRaw) as { serverPid?: number };
    if (serverPid) {
      try { process.kill(-serverPid); } catch {}
      try { process.kill(serverPid); } catch {}
    }
  } catch {}
});


