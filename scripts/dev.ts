import { $, ShellError } from 'bun'
import { watch } from 'fs'

const runBuild = async () => {
  try {
    const output = await $`bun run clean:bin && bun run build:script`.text()
    console.log(output)

    await $`bun link`.quiet()
  } catch (err) {
    const _err = err as ShellError
    console.error(err)
    console.error(_err?.stdout?.toString() ?? 'no stdout')
  }
}

await runBuild()
console.log('Watching for changes...\n')

const watcher = watch(`src`, { recursive: true }, async (event, filename) => {
  console.log(`Detected ${event} in ${filename}`)
  await runBuild()
})

process.on('SIGINT', () => {
  // close watcher when Ctrl-C is pressed
  console.log('Closing...')
  watcher.close()

  process.exit(0)
})
