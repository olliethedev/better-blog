
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { FileMigrationProvider, Kysely, Migrator } from 'kysely';

export async function migrateToLatest(kysely: Kysely<any>) {
    //use the same migration definition as the tests to avoid duplication
    // Handle both running from project root and from e2e directory
    const projectRoot = process.cwd().endsWith('/e2e') 
      ? path.join(process.cwd(), '..')
      : process.cwd();
      
    const migrationFolder = path.join(
      projectRoot,
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