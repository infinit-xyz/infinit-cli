import { protocolModules } from '@constants/protocol-module'
import { PROTOCOL_MODULE } from '@enums/module'
import { generateScriptText } from '@utils/script'
import { zodGetDefaults } from '@utils/zod'
import { describe, expect, test } from 'vitest'
import type { AnyZodObject } from 'zod'

describe('generateScriptText', () => {
  const initialAction = protocolModules[PROTOCOL_MODULE.aave_v3].actions.init
  const libPath = protocolModules[PROTOCOL_MODULE.aave_v3].libPath
  const paramsSchema = initialAction.paramsSchema as AnyZodObject
  const generatedText = generateScriptText(initialAction, libPath, 'init')

  test('should generate script text correctly (partial match)', () => {
    expect(generatedText).toContain(`import { ${initialAction.actionClassName}, type actions } from '${libPath}/actions'`)

    const zodObjectDefault = zodGetDefaults(initialAction.paramsSchema)
    const allZodKeys = Object.keys(zodObjectDefault)

    expect(generatedText).toContain(`type Param = z.infer<typeof actions['init']['paramsSchema']>`)
    expect(generatedText).toContain(`const params: Param = {`)
    allZodKeys.forEach((key) => {
      expect(generatedText).toContain(`"${key}": undefined`)
      expect(generatedText).toContain(`// TODO: ${paramsSchema.shape[key].description ?? ''}`)
    })

    expect(generatedText).toContain(`const signer = {`)
    initialAction.signers.forEach((signer) => {
      expect(generatedText).toContain(`"${signer}": ""`)
    })

    expect(generatedText).toContain(`export default { params, signer, Action: ${initialAction.actionClassName} }`)
  })

  test('should generate script text correctly (exact match)', () => {
    expect(generatedText).toEqual(`
import { DeployAaveV3Action, type actions } from '@infinit-xyz/aave-v3/actions'
import type { z } from 'zod'

type Param = z.infer<typeof actions['init']['paramsSchema']>

// TODO: Replace with actual params
const params: Param = {


  // TODO: Unique identifier for the AAVE market e.g. 'INFINIT-LENDING'
  "marketId": undefined,


  // TODO: Unique identifier for the addresses provider e.g. 1n
  "providerId": undefined,


  // TODO: Address of the treasury owner, managing protocol funds e.g. '0x123...abc'
  "treasuryOwner": undefined,


  // TODO: Address of the owner managing the address provider e.g. '0x123...abc'
  "addressesProviderOwner": undefined,


  // TODO: Address of the owner managing the address provider registry e.g. '0x123...abc'
  "addressesProviderRegistryOwner": undefined,


  // TODO: Address of the owner of the wrapped token gateway e.g. '0x123...abc'
  "wrappedTokenGatewayOwner": undefined,


  // TODO: Address of the Access Control List admin, managing protocol access e.g. '0x123...abc'
  "aclAdmin": undefined,


  // TODO: Address of the funds admin, managing funds distribution e.g. '0x123...abc'
  "fundsAdmin": undefined,


  // TODO: Address of the pool admin, managing lending pool settings e.g. '0x123...abc'
  "poolAdmin": undefined,


  // TODO: Address of the emergency admin, handling emergencies e.g. '0x123...abc'
  "emergencyAdmin": undefined,


  // TODO: Total flash loan premium rate in bps e.g. 50n
  "flashloanPremiumsTotal": undefined,


  // TODO: Portion of flash loan premium for the protocol in bps e.g. 50n
  "flashloanPremiumsProtocol": undefined,


  // TODO: Address of the Chainlink aggregator proxy for price data e.g. '0x123...abc'
  "chainlinkAggProxy": undefined,


  // TODO: Address of the Chainlink ETH/USD price feed proxy e.g. '0x123...abc'
  "chainlinkETHUSDAggProxy": undefined,


  // TODO: List of supported asset addresses
  "assets": undefined,


  // TODO: List of price feed source addresses
  "sources": undefined,


  // TODO: Address of the fallback oracle for backup price feeds e.g. '0x123...abc'
  "fallbackOracle": undefined,


  // TODO: Base token address of the protocol e.g. '0x123...abc'
  "baseCurrency": undefined,


  // TODO: Smallest unit of the base currency e.g. 1n
  "baseCurrencyUnit": undefined,


  // TODO: Address of the wrapped native token e.g. '0x123...abc'
  "wrappedNativeToken": undefined
}

// TODO: Replace with actual signer id
const signer = {
  "deployer": ""
}

export default { params, signer, Action: DeployAaveV3Action }

`)
  })

  test('should generate script text correctly with deployer (exact match)', () => {
    const generatedTextWithDeployer = generateScriptText(initialAction, libPath, 'init', 'test-deployer')
    expect(generatedTextWithDeployer).toEqual(`
import { DeployAaveV3Action, type actions } from '@infinit-xyz/aave-v3/actions'
import type { z } from 'zod'

type Param = z.infer<typeof actions['init']['paramsSchema']>

// TODO: Replace with actual params
const params: Param = {


  // TODO: Unique identifier for the AAVE market e.g. 'INFINIT-LENDING'
  "marketId": undefined,


  // TODO: Unique identifier for the addresses provider e.g. 1n
  "providerId": undefined,


  // TODO: Address of the treasury owner, managing protocol funds e.g. '0x123...abc'
  "treasuryOwner": undefined,


  // TODO: Address of the owner managing the address provider e.g. '0x123...abc'
  "addressesProviderOwner": undefined,


  // TODO: Address of the owner managing the address provider registry e.g. '0x123...abc'
  "addressesProviderRegistryOwner": undefined,


  // TODO: Address of the owner of the wrapped token gateway e.g. '0x123...abc'
  "wrappedTokenGatewayOwner": undefined,


  // TODO: Address of the Access Control List admin, managing protocol access e.g. '0x123...abc'
  "aclAdmin": undefined,


  // TODO: Address of the funds admin, managing funds distribution e.g. '0x123...abc'
  "fundsAdmin": undefined,


  // TODO: Address of the pool admin, managing lending pool settings e.g. '0x123...abc'
  "poolAdmin": undefined,


  // TODO: Address of the emergency admin, handling emergencies e.g. '0x123...abc'
  "emergencyAdmin": undefined,


  // TODO: Total flash loan premium rate in bps e.g. 50n
  "flashloanPremiumsTotal": undefined,


  // TODO: Portion of flash loan premium for the protocol in bps e.g. 50n
  "flashloanPremiumsProtocol": undefined,


  // TODO: Address of the Chainlink aggregator proxy for price data e.g. '0x123...abc'
  "chainlinkAggProxy": undefined,


  // TODO: Address of the Chainlink ETH/USD price feed proxy e.g. '0x123...abc'
  "chainlinkETHUSDAggProxy": undefined,


  // TODO: List of supported asset addresses
  "assets": undefined,


  // TODO: List of price feed source addresses
  "sources": undefined,


  // TODO: Address of the fallback oracle for backup price feeds e.g. '0x123...abc'
  "fallbackOracle": undefined,


  // TODO: Base token address of the protocol e.g. '0x123...abc'
  "baseCurrency": undefined,


  // TODO: Smallest unit of the base currency e.g. 1n
  "baseCurrencyUnit": undefined,


  // TODO: Address of the wrapped native token e.g. '0x123...abc'
  "wrappedNativeToken": undefined
}

// TODO: Replace with actual signer id
const signer = {
  "deployer": "test-deployer"
}

export default { params, signer, Action: DeployAaveV3Action }

`)
  })
})
