import { PACKAGE_MANAGER } from '@enums/package-managers'
import { getPackageManagerInstallArgs } from '@utils/packageManager'
import { describe, expect, test } from 'vitest'

describe('packageManager', () => {
  describe('getPackageManagerInstallArgs', () => {
    test('should return install args for npm', () => {
      const result = getPackageManagerInstallArgs(PACKAGE_MANAGER.npm, false)

      expect(result).toStrictEqual(['install', '--no-audit', '--save', '--save-exact', '--loglevel', 'error'])
    })

    test('should return install args with devDependencies for npm', () => {
      const result = getPackageManagerInstallArgs(PACKAGE_MANAGER.npm, true)

      expect(result).toStrictEqual(['install', '--no-audit', '--save-dev', '--save-exact', '--loglevel', 'error'])
    })
  })
})
