import ora from 'ora'
import { type MockInstance, beforeAll, describe, expect, test, vi } from 'vitest'

import { BufferedStream } from '@classes/BufferedStream/BufferedStream'
import { completelyRemoveAnsi } from '@utils/ansi'
import type { Address } from 'viem'
import { verifyContractCallbackHandler } from './callback'

const rm = completelyRemoveAnsi

describe('callback.ts', () => {
  describe('verifyContractCallbackHandler', () => {
    const FAKE_BLOCK_EXPLORER_URL = 'FAKE_BLOCK_EXPLORER_URL'
    const MOCK_CONTRACT_DATA: {
      contractName: string
      address: Address
    }[] = [
      {
        contractName: 'contractName1',
        address: '0x001',
      },
      {
        contractName: 'contractName2',
        address: '0x002',
      },
      {
        contractName: 'contractName3',
        address: '0x003',
      },
    ]

    const customStream = new BufferedStream()

    const spinner = ora({ spinner: 'dots', stream: customStream })
    const callback = verifyContractCallbackHandler(spinner, FAKE_BLOCK_EXPLORER_URL)
    let consoleLogSpy: MockInstance<Console['log']>

    beforeAll(() => {
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    })

    test('should handle contractVerificationInfo correctly', () => {
      callback('contractVerificationInfo', { totalContracts: MOCK_CONTRACT_DATA.length })
      expect(consoleLogSpy).toHaveBeenCalledWith(`📝 Verifying ${MOCK_CONTRACT_DATA.length} contracts in total.`)
    })

    test('should handle contractVerificationStarted, contractVerificationSubmitted, contractVerificationFinished correctly', () => {
      for (let i = 0; i < MOCK_CONTRACT_DATA.length; ++i) {
        const contractName = MOCK_CONTRACT_DATA[i].contractName
        const address: Address = MOCK_CONTRACT_DATA[i].address

        callback('contractVerificationStarted', { contractName: contractName, address: address })
        expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`- (${i + 1}/${MOCK_CONTRACT_DATA.length}) Verifying ${contractName} (${address})\n`)

        callback('contractVerificationSubmitted', { contractName: contractName, address: address })
        // we are currently not doing anything when submitted so the log should be from previous action
        expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`- (${i + 1}/${MOCK_CONTRACT_DATA.length}) Verifying ${contractName} (${address})\n`)

        callback('contractVerificationFinished', { contractName: contractName, address: address })
        if (i === MOCK_CONTRACT_DATA.length - 1) {
          // last one
          expect(rm(customStream.getLastChunk({ raw: true }))).toBe(
            `🎉 Contract verification completed. Visit ${FAKE_BLOCK_EXPLORER_URL} to view the result.\n`,
          )
        } else {
          expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`✔ (${i + 1}/${MOCK_CONTRACT_DATA.length}) Verified ${contractName} (${address})\n`)
        }
      }
    })
  })
})
