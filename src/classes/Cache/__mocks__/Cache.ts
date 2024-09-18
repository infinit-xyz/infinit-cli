import path from 'path'

import { Cache } from '@classes/Cache/Cache'
import { FILE_NAMES } from '@constants'
import { writeFileSync } from '@utils/files'
import fs from 'fs'
import { afterAll } from 'vitest'

/**
 * Clean up
 */

afterAll(() => {
  try {
    fs.rmSync(cache.getCacheFilePath())
  } catch (e) {
    throw e
  }
})

/**
 * Cache file is expected to be generated or created before cache instance is created, so we need to create it first
 */
const cacheMockFileBasePath = path.join(__dirname, '..', '..', '..', '..', '..', 'infinit-test-script-area', 'test-caches-mock')
const cacheMockFilePath = path.join(cacheMockFileBasePath, FILE_NAMES.CACHE)
const cacheDefaultData = JSON.stringify(Cache.getCacheDefault(), undefined, 2)

writeFileSync(cacheMockFilePath, cacheDefaultData)

const cache = new Cache(cacheMockFileBasePath)

export { cache, Cache }
