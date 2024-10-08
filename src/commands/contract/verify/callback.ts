import { chalkBold, chalkDim, chalkInfo } from '@constants/chalk'
import type { ContractVerifierCallbackParams } from '@infinit-xyz/core/internal'
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
          `(${verifiedContracts + 1}/${totalContracts}) Verifying ${chalkBold(chalkInfo(parsedValue.contractName))} ${chalkDim(`(${parsedValue.address})`)}`,
        )
      })
      .with('contractVerificationSubmitted', () => {
        // will not show anything when submitted.
      })
      .with('contractVerificationFinished', () => {
        const parsedValue = value as CallbackParams['contractVerificationFinished']
        spinner.succeed(
          `(${verifiedContracts + 1}/${totalContracts}) Verified ${chalkBold(chalkInfo(parsedValue.contractName))} ${chalkDim(`(${parsedValue.address})`)}`,
        )
        verifiedContracts++

        if (verifiedContracts === totalContracts) {
          spinner.stopAndPersist({ symbol: '🎉', text: `Contract verification completed. Visit ${chalkInfo(blockExplorerUrl)} to view the result.` })
        }
      })
      .exhaustive()
  }
}
