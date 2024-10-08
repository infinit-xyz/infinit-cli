import { BufferedStream } from '@classes/BufferedStream/BufferedStream'
import { completelyRemoveAnsi } from '@utils/ansi'
import ora from 'ora'
import { describe, expect, test, vi } from 'vitest'
import { verifyContractCallbackHandler } from '.'

const rm = completelyRemoveAnsi

describe('contract verify', () => {
  test('callback handler', () => {
    const customStream = new BufferedStream()

    const spinner = ora({ spinner: 'dots', stream: customStream })
    const callback = verifyContractCallbackHandler(spinner)
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    callback('contractVerificationInfo', { totalContracts: 3 })
    expect(consoleLogSpy).toHaveBeenCalledWith('📝 Total contracts: 3')

    callback('contractVerificationStarted', { contractName: 'contractName', address: '0x001' })
    expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`- (1/3) 🔍 Verifying... contractName (0x001)\n`)

    callback('contractVerificationSubmitted', { contractName: 'contractName', address: '0x001' })
    expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`- (1/3) 🚀 Submitted contractName (0x001)\n`)

    callback('contractVerificationFinished', { contractName: 'contractName', address: '0x001' })
    expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`✔ (1/3) Verified contractName (0x001)\n`)

    callback('contractVerificationStarted', { contractName: 'contractName2', address: '0x002' })
    expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`- (2/3) 🔍 Verifying... contractName2 (0x002)\n`)

    callback('contractVerificationFinished', { contractName: 'contractName2', address: '0x002' })
    expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`✔ (2/3) Verified contractName2 (0x002)\n`)

    callback('contractVerificationStarted', { contractName: 'contractName3', address: '0x003' })
    expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`- (3/3) 🔍 Verifying... contractName3 (0x003)\n`)

    callback('contractVerificationFinished', { contractName: 'contractName3', address: '0x003' })
    expect(rm(customStream.getLastChunk({ raw: true }))).toBe(`🎉 All 3 contracts have been verified!\n`)
  })
})
