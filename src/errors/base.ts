// ref: https://github.com/wevm/viem/blob/main/src/errors/base.ts
import { name as cliName, version as cliVersion } from 'package.json'

type BaseErrorParameters = {
  cause?: BaseError | Error | undefined
  details?: string | undefined
  name?: string | undefined
}

export type BaseErrorType = BaseError & { name: 'BaseError' }
export class BaseError extends Error {
  details: string
  metaMessages?: string[] | undefined
  shortMessage: string
  cliVersion: string

  private _stack: string

  override name = 'BaseError'

  constructor(shortMessage: string, args: BaseErrorParameters = {}) {
    const details = (() => {
      if (args.cause instanceof BaseError) return args.cause.details
      if (args.cause?.message) return args.cause.message
      return args.details!
    })()

    const nodeVersion = process.versions.node
    const message = [shortMessage, ...(details ? [`Details: ${details}`] : [])].join('\n')

    super(message, args.cause ? { cause: args.cause } : undefined)

    this._stack = this.stack ?? ''

    Object.defineProperty(this, 'stack', {
      get: () => {
        // override stack variable to remove the first line (which is the error message)
        const stacks = this._stack?.split('\n')
        const stackTrace = stacks.slice(1, stacks.length).join('\n')

        const version = [`${cliName}: ${cliVersion}`, `Node: ${nodeVersion}`].join('\n')

        const displayStack = [stackTrace, version].join('\n\n')

        return displayStack
      },
    })

    this.details = details
    this.name = args.name ?? this.name
    this.shortMessage = shortMessage
    this.cliVersion = cliVersion
  }
}
