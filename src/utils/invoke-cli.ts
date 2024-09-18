import { createLogsMatcher } from '@utils/matcher'
import type { ExecaSyncError } from 'execa'
import { execaSync } from 'execa'
import process from 'node:process'
import path from 'path'
import strip from 'strip-ansi'

const builtCliPath = path.join(__dirname, '../..', 'bin', 'cli.js')

type CreateLogsMatcherReturn = ReturnType<typeof createLogsMatcher>
export type InvokeResult = [exitCode: number | undefined, logsMatcher: CreateLogsMatcherReturn, errorLogsMatcher: CreateLogsMatcherReturn]

export function InfinitCLI() {
  let cwd = ''
  let cliPath: string | undefined

  const self = {
    setCwd: (_cwd: string) => {
      cwd = _cwd
      return self
    },
    setCliPath: (_cliPath: string) => {
      cliPath = _cliPath
      return self
    },
    invoke: async (args: Array<string>): Promise<InvokeResult> => {
      const NODE_ENV = 'production'

      try {
        const results = execaSync(process.execPath, [cliPath ?? builtCliPath].concat(args), {
          cwd,
          env: { NODE_ENV, IS_TEST: 'true' },
        })

        return [results.exitCode, createLogsMatcher(results.stdout.toString()), createLogsMatcher(results.stderr.toString())]
      } catch (e) {
        console.error(e)
        const execaError = e as ExecaSyncError
        return [
          execaError.exitCode,
          createLogsMatcher(strip(execaError.stdout?.toString() || ``)),
          createLogsMatcher(strip(execaError.stderr?.toString() || ``)),
        ]
      }
    },
  }

  return self
}

export const isRunFromNodeModules = (): boolean => {
  return process.argv.some((arg) => arg.includes('node_modules'))
}

export const isRunOnGlobalOnly = (): void => {
  return

  // TODO: Fix this logic when published
  // if (isRunFromNodeModules()) {
  //   console.log(chalkError('Please run this command from npx or yarn global only'))
  //   process.exit(1)
  // }
}

export const isRunOnLocalOnly = (): void => {
  return

  // TODO: Fix this logic when published
  // if (!isRunFromNodeModules()) {
  //   console.log(chalkError('Please run this command from local only'))
  //   process.exit(1)
  // }
}
