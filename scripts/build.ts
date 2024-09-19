import { $ } from 'bun'
import os from 'os'

try {
  const externalPackages = [
    'commander',
    'inquirer',
    '@inquirer/prompts',
    'chalk',
    'ts-functional-pipe',
    '@ethereumjs/wallet',
    'viem',
    'js-yaml',
    'fs-extra',
    'cli-progress',
    'mute-stream',
    'universalify',
    'graceful-fs',
    'ansi-escapes',
    'strip-ansi',
    '@infinit-xyz/core',
    '@infinit-xyz/aave-v3',
    '@infinit-xyz/uniswap-v3',
    '@infinit-xyz/token',
    'lodash',
    'onetime',
    'signal-exit',
    'cli-spinners',
    'ora',
    'esbuild',
    'colors',
    'cli-table3',
    'zod',
    'ts-pattern',
    'tsx',
    'get-tsconfig',
    'resolve-pkg-maps',
    'is-fullwidth-code-point',
    'emoji-regex',
    'string-width',
    '@colors/colors',
    'prool',
    '@ethersproject',
    'js-sha3',
    '@openzeppelin',
    'hardhat',
  ]

  if (new Set(externalPackages).size != externalPackages.length) {
    throw new Error('Duplicate package found in externalPackages')
  }

  // build and bundle
  const results = await Bun.build({
    target: 'node',
    entrypoints: ['src/index.ts'],
    outdir: './bin',
    naming: '[dir]/[name].[ext]',
    external: externalPackages,
  })

  if (!results.success) {
    for (const message of results.logs) {
      console.error(message)
    }

    throw new Error('Build failed')
  } else {
    console.log('✅ Built ' + results.outputs.length + ' files')
  }

  // Generate dist folders to store assets
  await $`rm -rf dist`
  await $`mkdir dist`

  if (os.platform() === 'win32') {
    await $`xcopy src\\schemas dist\\schemas /E /I /Y`
  } else {
    await $`cp -r src/schemas dist/schemas`
  }

  console.log('✅ Generated dist')
} catch (error) {
  console.error('❌ Error in scripts/build.ts')
  console.error(error)

  process.exit(1)
}
