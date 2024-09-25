import { name as cliName, version as cliVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { BaseError } from '@errors/base'

describe('BaseError', () => {
  const nodeVersion = process.versions.node
  test('BaseError', () => {
    expect(BaseError).toBeDefined()

    expect(new BaseError('An error occurred.')).toMatchInlineSnapshot(`
        [BaseError: An error occurred.
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)

    expect(new BaseError('')).toMatchInlineSnapshot(`
        [BaseError: An error occurred.
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)

    expect(new BaseError('', { details: 'details' })).toMatchInlineSnapshot(`
        [BaseError: An error occurred.
        Details: details
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)

    expect(new BaseError('', { cause: new BaseError('error') })).toMatchInlineSnapshot(`
        [BaseError: An error occurred.
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)
  })
})
