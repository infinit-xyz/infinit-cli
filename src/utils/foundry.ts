import { spawnChild } from '@utils/childprocess'

export const checkIsFoundryInstalled = async () => {
  try {
    await spawnChild('which', ['foundryup', 'anvil', 'forge'])
    return true
  } catch (_error) {
    throw new Error('Foundry is not installed')
  }
}
