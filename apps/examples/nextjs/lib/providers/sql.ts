import { createSQLProvider } from 'better-blog/providers/sql';
import type { BlogDataProvider } from 'better-blog/types';
import { Pool } from 'pg';

let providerPromise: Promise<BlogDataProvider> | null = null;

export function getSqlProvider(): Promise<BlogDataProvider> {
  if (!providerPromise) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is required for sql provider');
    const pool = new Pool({ connectionString: url });
    providerPromise = createSQLProvider({ database: pool });
  }
  return providerPromise;
}


