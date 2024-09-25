import { name as cliName, version as cliVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { FileNotFoundError } from '@errors/index'

describe('FileNotFoundError', () => {
  const nodeVersion = process.versions.node
  test('should match snapshot', () => {
    expect(new FileNotFoundError('path', 'value')).toMatchInlineSnapshot(`
        [FileNotFoundError: ${ERROR_MESSAGE_RECORD.FILE_PATH_NOT_FOUND('value')}
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)

    expect(new FileNotFoundError('name', 'value')).toMatchInlineSnapshot(`
        [FileNotFoundError: ${ERROR_MESSAGE_RECORD.FILE_NAME_NOT_FOUND('value')}
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)
  })
})
