import { name as cliName, version as cliVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { CacheNotFoundError } from '@errors/index'

describe('CacheNotFoundError', () => {
  const nodeVersion = process.versions.node

  test('should match snapshot', () => {
    expect(new CacheNotFoundError('tx', 'value')).toMatchInlineSnapshot(`
        [CacheNotFoundError: Tx hash value not found in cache
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)

    expect(new CacheNotFoundError('subAction', 'value')).toMatchInlineSnapshot(`
        [CacheNotFoundError: Sub action value not found in cache
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)

    expect(new CacheNotFoundError('script', 'value')).toMatchInlineSnapshot(`
        [CacheNotFoundError: Script value not found in cache
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)
  })
})
