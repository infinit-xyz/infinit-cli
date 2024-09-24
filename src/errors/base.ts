// ref: https://github.com/wevm/viem/blob/main/src/errors/base.ts
import { name as cliName, version as cliVersion } from 'package.json'

export type BaseErrorParameters = {
  cause?: BaseError | Error | undefined
  details?: string | undefined
  name?: string | undefined
}

export type BaseErrorType = BaseError & { name: 'BaseError' }

export type BaseErrorOptions = {
  isStackDisabled?: boolean
}
export class BaseError extends Error {
  details: string
  metaMessages?: string[] | undefined
  shortMessage: string
  cliVersion: string

  // private _stack: string

  override name = 'BaseError'

  constructor(shortMessage: string, args: BaseErrorParameters = {}, _options: BaseErrorOptions = {}) {
    const details = (() => {
      if (args.cause instanceof BaseError) return args.cause.details
      if (args.cause?.message) return args.cause.message
      return args.details!
    })()

    const nodeVersion = process.versions.node
    const message = [shortMessage, ...(details ? [`Details: ${details}`] : []), `${cliName}: ${cliVersion}`, `Node: ${nodeVersion}`].join('\n')

    super(message, args.cause ? { cause: args.cause } : undefined)

    // TODO: improve error stack trace
    // this._stack = this.stack ?? ''
    // Object.defineProperty(this, 'stack', {
    //   get: () => {
    //     const { isStackDisabled } = options
    //     // const stacks = this._stack?.split('\n')

    //     // find stack trace file name and line number
    //     // const stackTraceIndex = stacks.findIndex((stack) => stack.includes('    at'))
    //     // const stackTrace = stacks.slice(stackTraceIndex, stacks.length).join('\n')

    //     const version = [`${cliName}: ${cliVersion}`, `Node: ${nodeVersion}`].join('\n')

    //     const displayStack = [version, ...(isStackDisabled ? [] : [stackTrace])].join('\n\n')

    //     return displayStack
    //   },
    // })

    this.details = details
    this.name = args.name ?? this.name
    this.shortMessage = shortMessage
    this.cliVersion = cliVersion
  }
}
