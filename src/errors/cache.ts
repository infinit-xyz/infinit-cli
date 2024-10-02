import { BaseError } from '@errors/base.ts'
import { match } from 'ts-pattern'

export class CacheNotFoundError extends BaseError {
  constructor(type: 'subAction' | 'tx' | 'script', value: string) {
    const typeDisplay = match(type)
      .with('tx', () => 'Tx hash')
      .with('subAction', () => 'Sub action')
      .with('script', () => 'Script')
      .exhaustive()
    super(`${typeDisplay} ${value} not found in cache`, {
      name: 'CacheNotFoundError',
    })
  }
}
