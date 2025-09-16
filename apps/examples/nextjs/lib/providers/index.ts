import type { BlogDataProvider } from 'better-blog/types'
import { memoryProvider } from './memory'
import { getSqlProvider } from './sql'

let cached: Promise<BlogDataProvider> | null = null

export async function getProvider(): Promise<BlogDataProvider> {
  if (!cached) {
    const choice = process.env.BETTER_BLOG_PROVIDER || 'memory'
    if (choice === 'sql' || choice === 'kysely' || choice === 'postgres') {
      cached = getSqlProvider()
    } else {
      cached = Promise.resolve(memoryProvider)
    }
  }
  return cached
}


