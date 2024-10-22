import { Option, program } from 'commander'

import { handleDeleteAccount, handleExportAccount, handleGenerateAccount, handleImportAccount, handleListAccounts } from '@commands/account'
import { handleListAction } from '@commands/action'
import { handleCompileProject } from '@commands/contract/compile'
import { handleVerifyContract } from '@commands/contract/verify'
import { handleInitializeCli } from '@commands/init'
import { handleExecuteScript, handleGenerateScript } from '@commands/script'
import { EXPECTED_NODE_VERSION } from '@constants'
import { chalkError } from '@constants/chalk'
import { isRunOnLocalOnly } from '@utils/invoke-cli'

import { customErrorLog } from '@errors/log'
import { checkIsFoundryInstalled } from '@utils/foundry'
import { version } from '../package.json'

// Function to validate Node.js version
const validateNodeVersion = () => {
  const currentVersion = process.versions.node

  const [currentMajor] = currentVersion.split('.')
  const [requiredMajor] = EXPECTED_NODE_VERSION.split('.')

  if (parseInt(currentMajor) < parseInt(requiredMajor)) {
    console.error(chalkError(`Error: Node.js version must be ${EXPECTED_NODE_VERSION} or higher. You are using ${currentVersion}.`))
    process.exit(1)
  }
}

program.name('INFINIT CLI').usage('<command> [options]').version(version, '-v, --version')

// Add global hook to validate before executing commands
program.hook('preAction', () => {
  validateNodeVersion()
})

program
  .command('init')
  .description('Initialize INFINIT CLI')
  .option('-d, --directory <char>', 'Project Directory')
  .option('-m, --module <char>', 'Protocol Module')
  .option('-c, --chain <char>', 'Chain')
  .option('--deployer <char>', 'Deployer account ID')
  // hidden
  .addOption(new Option('--ignore-deployer', 'Do not ask for deployer account ID').hideHelp())
  .addOption(new Option('--ignore-analytics', 'Do not ask for analytics tracking').hideHelp())

  .action(async (input) => {
    await handleInitializeCli(input)
  })

// const projectCommands = program.command('project').description('Manage an INFINIT project')
// projectCommands
//   .command('create')
//   .description('Initialize a new INFINIT project')
//   .option('-n, --name <char>', 'Project name')
//   .option('-m, --module <char>', 'Protocol Module')
//   .option('-c, --chain <char>', 'Chain')

//   .option('--use-npm', 'Use npm to install dependencies')
//   .option('--use-yarn', 'Use yarn to install dependencies')
//   .option('--use-pnpm', 'Use pnpm to install dependencies')
//   .option('--use-bun', 'Use bun to install dependencies')

//   .option('--custom-rpc <char>', 'RPC URL for custom chain')
//   .option('--custom-chainId <char>', 'Chain ID for custom chain')
//   .option('--custom-chainName <char>', 'Chain for custom chain')

//   .option('--confirm', 'Confirm create project')

//   .action(async (input) => {
//     isRunOnGlobalOnly()
//     await handleProjectCreate(input)
//   })

// projectCommands
//   .command('compile')
//   .description('Compile project smart contract code')
//   .action(async () => {
//     await handleCompileProject()
//   })

/**
 * Account scope commands
 */
const accountCommands = program.command('account').description('Manage local accounts')

accountCommands
  .command('list')
  .description('List available accounts')
  .action(async () => {
    isRunOnLocalOnly()
    await handleListAccounts()
  })

accountCommands
  .command('import')
  .description('Import an existing account into INFINIT CLI')
  .argument('[id]', 'Account ID') // optional
  .action(async (id: string) => {
    isRunOnLocalOnly()
    await handleImportAccount(id)
  })

accountCommands
  .command('generate')
  .description('Generate a new account with a random private key')
  .argument('[id]', 'Account ID') // optional
  .action(async (id: string) => {
    isRunOnLocalOnly()
    await handleGenerateAccount(id)
  })

accountCommands
  .command('delete')
  .description('Delete an account')
  .argument('<id>', 'Account ID') // required
  .action(async (id: string) => {
    await handleDeleteAccount(id)
  })

accountCommands
  .command('export')
  .description('Export an account private key')
  .argument('<id>', 'Account ID') // required
  .action(async (id) => {
    await handleExportAccount(id)
  })

/**
 * Action scope commands
 */
const actionCommands = program.command('action').description('Manage INFINIT actions')

actionCommands
  .command('list')
  .description('List available actions')
  .action(() => {
    isRunOnLocalOnly()
    handleListAction()
  })

/**
 * Script scope commands
 */
const scriptCommands = program.command('script').description('Manage INFINIT scripts')

scriptCommands
  .command('generate')
  .description('Create a new script in the scripts/ folder')
  .argument('[id]', 'Action ID') // optional
  .action(async (id?: string) => {
    isRunOnLocalOnly()
    await handleGenerateScript(id)
  })

scriptCommands
  .command('execute')
  .description('Execute a specified script in the scripts/ folder')
  .argument('[file]', 'Script file name') // optional
  .option('--ignore-cache', 'Execute without using saved cache (if any)')
  .hook('preAction', async () => {
    try {
      await checkIsFoundryInstalled()
    } catch (error) {
      console.error(customErrorLog(error as Error))
      process.exit(1)
    }
  })
  .action(async (fileName, option) => {
    isRunOnLocalOnly()
    await handleExecuteScript(fileName, option)
  })

/**
 * Project scope commands
 */
const projectCommands = program.command('project').description('[Deprecated] Manage an INFINIT project')

projectCommands
  .command('compile')
  .description('[Deprecated] Please use `infinit contract compile` instead')
  .action(() => {
    console.error(chalkError('This command is deprecated. Please use `infinit contract compile` instead.'))
  })

/**
 * Contract scope commands
 */
const contractCommands = program.command('contract').description('Manage INFINIT contracts')

contractCommands
  .command('verify')
  .description('Verify contracts on the blockchain explorer')
  .action(async () => {
    isRunOnLocalOnly()
    await handleVerifyContract()
  })

contractCommands
  .command('compile')
  .description('Compile project smart contract code')
  .action(async () => {
    await handleCompileProject()
  })

program.showSuggestionAfterError(true)
program.parse(process.argv)
