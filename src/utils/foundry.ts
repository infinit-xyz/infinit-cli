import { spawnChild } from '@utils/childprocess'

export const checkIsFoundryInstalled = async () => {
  try {
    await Promise.all([spawnChild('anvil', ['--version']), spawnChild('forge', ['--version'])])
    return true
  } catch (_error) {
    return false
  }
}
