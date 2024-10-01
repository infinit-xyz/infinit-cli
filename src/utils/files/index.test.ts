import * as files from '@utils/files'
import { describe, expect, test } from 'vitest'

describe('@utils/files', () => {
  test('should match snapshot', () => {
    expect(files).toMatchSnapshot()
  })
})
