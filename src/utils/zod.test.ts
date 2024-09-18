import { zodGetDefaults } from '@utils/zod'
import { describe, expect, test } from 'vitest'
import { z } from 'zod'

describe('zod', () => {
  describe('zodGetDefaults', () => {
    const exampleSchema = z.object({
      i_am_string: z.string(),
      i_am_number: z.number(),
      i_am_bigint: z.bigint(),
    })

    test('should return defaults object', () => {
      const result = zodGetDefaults(exampleSchema)

      expect(result).toStrictEqual({
        i_am_string: undefined,
        i_am_number: undefined,
        i_am_bigint: undefined,
      })
    })
  })
})
