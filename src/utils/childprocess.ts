import { spawn } from 'node:child_process'

export const spawnChild = (cmd: string, args: string[], env?: NodeJS.ProcessEnv) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'pipe', env: { ...process.env, ...env } })
    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: `${cmd} ${args.join(' ')}`,
        })
        return
      }
      resolve('')
    })
    child.on('error', (err) => {
      console.error('Failed to start subprocess.')
      console.error(JSON.stringify(err, undefined, 2))
      reject(err)
      resolve('')
    })
  })
}
