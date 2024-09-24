import { BaseError } from '@errors/base.ts'
import { match } from 'ts-pattern'

export class FoundInvalidCachedTxError extends BaseError {
  constructor() {
    super(`Found a successful Tx after a failed Tx, please contract support`, {
      name: 'FoundInvalidCachedTxError',
    })
  }
}

export class IncorrectCacheError extends BaseError {
  constructor(reason = 'None') {
    super([`Found a cache but the cache is incorrect`, `Reason: ${reason}`].join('\n'), {
      name: 'IncorrectCacheError',
    })
  }
}

export class CacheNotFoundError extends BaseError {
  constructor(type: 'subAction' | 'tx' | 'script', value: string) {
    const typeDisplay = match(type)
      .with('tx', () => 'Tx hash')
      .with('subAction', () => 'Sub action')
      .with('script', () => 'Script')
      .exhaustive()
    super(['CacheNotFoundError:' + ` ${typeDisplay} ${value} not found in cache`].join('\n'), {
      name: 'CacheNotFoundError',
    })
  }
}
