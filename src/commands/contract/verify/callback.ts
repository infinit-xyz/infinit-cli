import { chalkInfo } from '@constants/chalk'
import type { ContractVerifierCallbackParams } from '@infinit-xyz/core/internal'
import chalk from 'chalk'
import { type Ora } from 'ora'
import { match } from 'ts-pattern'

type CallbackParams = ContractVerifierCallbackParams

export const verifyContractCallbackHandler = (spinner: Ora, blockExplorerUrl: string) => {
  let totalContracts = 0
  let verifiedContracts = 0

  return async (key: keyof CallbackParams, value: CallbackParams[keyof CallbackParams]) => {
    match(key)
      .with('contractVerificationInfo', () => {
        const parsedValue = value as CallbackParams['contractVerificationInfo']
        totalContracts = parsedValue.totalContracts

        console.log('')
        console.log(`📝 Verifying ${totalContracts} contract${totalContracts > 1 ? 's' : ''} in total.`)
      })
      .with('contractVerificationStarted', () => {
        const parsedValue = value as CallbackParams['contractVerificationStarted']
        spinner.start(
          `(${verifiedContracts + 1}/${totalContracts}) Verifying ${chalk.bold(chalkInfo(parsedValue.contractName))} ${chalk.dim(`(${parsedValue.address})`)}`,
        )
        spinner.start(`Total contracts: ${totalContracts}`)
      })
      .with('contractVerificationSubmitted', () => {
        const parsedValue = value as CallbackParams['contractVerificationSubmitted']
        spinner.start(
          `(${verifiedContracts + 1}/${totalContracts}) Verifying ${chalk.bold(chalkInfo(parsedValue.contractName))} ${chalk.dim(`(${parsedValue.address})`)}`,
        )
      })
      .with('contractVerificationFinished', () => {
        const parsedValue = value as CallbackParams['contractVerificationFinished']
        spinner.succeed(
          `(${verifiedContracts + 1}/${totalContracts}) Verified ${chalk.bold(chalkInfo(parsedValue.contractName))} ${chalk.dim(`(${parsedValue.address})`)}`,
        )
        verifiedContracts++

        if (verifiedContracts === totalContracts) {
          spinner.stopAndPersist({ symbol: '🎉', text: `Contract verification completed. Visit ${chalkInfo(blockExplorerUrl)} to view the result.` })
        }
      })
      .exhaustive()
  }
}
