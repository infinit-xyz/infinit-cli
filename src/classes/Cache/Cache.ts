import type { InfinitCache } from '@infinit-xyz/core'

import fs from 'fs'
import path from 'path'

import { FILE_NAMES } from '@constants'
import { chalkError } from '@constants/chalk'
import { isCwdRootProject, writeFileSync } from '@utils/files'
import { jsonSafeParse, parseDateReviver, stringifyDateReplacer } from '@utils/json'
import { type InfinitCliCache, type InfinitCliCacheTxAction, type InfinitCliCacheTxInfo, InfinitCliCacheZod, type ScriptHash, type TxHash } from './Cache.type'

class Cache {
  private infinitCliCache: InfinitCliCache
  private readonly cacheFilePath: string

  private readonly isCacheBasePathSpecified: boolean

  constructor(cacheBasePath?: string) {
    const cacheDefaultPath = path.join(process.cwd(), 'cache')
    this.cacheFilePath = path.join(cacheBasePath ?? cacheDefaultPath, FILE_NAMES.CACHE)
    this.isCacheBasePathSpecified = !!cacheBasePath

    this.infinitCliCache = this.loadCache()
  }

  /**
   * Static
   */
  public static getCacheDefault(): InfinitCliCache {
    return InfinitCliCacheZod.parse({})
  }

  /**
   * Private methods
   */

  /**
   * load cache from file, if not found return empty object
   * should be called only once in constructor
   *
   * @returns InfinitCliCache
   */
  private loadCache(): InfinitCliCache {
    const { isRunningFromRootProject } = isCwdRootProject()

    if (!isRunningFromRootProject && !this.isCacheBasePathSpecified) return Cache.getCacheDefault()

    const isCacheFileExist = fs.existsSync(this.cacheFilePath)

    if (!isCacheFileExist) {
      console.error(chalkError(`Cache file not found at ${this.cacheFilePath}. New cache file will be created.`))
      return Cache.getCacheDefault()
    }

    const cacheFile = fs.readFileSync(this.cacheFilePath, 'utf-8')
    const parsedCacheResult = jsonSafeParse(cacheFile, parseDateReviver)
    if (!parsedCacheResult.success) {
      this.handleLoadCacheError()
      return Cache.getCacheDefault()
    }

    const zodParsedCacheFile = InfinitCliCacheZod.safeParse(parsedCacheResult.parsedJson)

    if (!zodParsedCacheFile.success) {
      this.handleLoadCacheError()
      return Cache.getCacheDefault()
    }

    return zodParsedCacheFile.data ?? Cache.getCacheDefault()
  }

  private handleLoadCacheError() {
    const backupFileName = `infinit-${Math.floor(Date.now() / 1000)}.cache.bak.json`
    const backupFilePath = path.join(this.cacheFilePath, '..', backupFileName)
    fs.renameSync(this.cacheFilePath, path.join(this.cacheFilePath, '..', backupFileName))

    console.error(chalkError(`Error parsing cache file at ${this.cacheFilePath}. New cache file will be created.`))
    console.error(chalkError(`Current cache file will be moved to ${backupFilePath}`))
  }

  /**
   * save cache to file
   * should be called every time cache is updated
   */
  private saveCache() {
    const stringifiedCache = JSON.stringify(this.infinitCliCache, stringifyDateReplacer)
    writeFileSync(this.cacheFilePath, stringifiedCache)
  }

  /**
   * Public methods
   */

  public getCache(): InfinitCliCache {
    return this.infinitCliCache
  }

  public getCacheFilePath(): string {
    return this.cacheFilePath
  }

  public getActionTxCache(scriptHash: ScriptHash): InfinitCliCacheTxAction | undefined {
    return this.infinitCliCache.txs[scriptHash]
  }

  /**
   * Get action transaction cache for executing action in @infinit-xyz/core
   * @param scriptHash hash of the action (currently file name)
   * @returns action transaction cache or undefined if not found
   */
  public getActionTxCacheForExecute(scriptHash: ScriptHash): InfinitCache | undefined {
    const actionTxCache = this.getActionTxCache(scriptHash)
    if (!actionTxCache) return undefined

    const { actionName, subActions } = actionTxCache
    if (!actionName) return undefined

    return {
      name: actionName,
      subActions: subActions.map(({ subActionName, txHashes }) => ({
        name: subActionName,
        transactions: txHashes.map(({ txBuilderName, txHash }) => ({
          name: txBuilderName,
          txHash,
        })),
      })),
    }
  }

  /**
   * Add action tx cache, if already exist update action name
   * @param scriptHash hash of script (currently script file name)
   * @param actionName name of action
   * @returns
   */
  public addTxActionCache(scriptHash: ScriptHash, actionName: string) {
    if (this.infinitCliCache.txs[scriptHash]) {
      this.infinitCliCache.txs[scriptHash].actionName = actionName
      this.saveCache()
      return
    }

    this.infinitCliCache.txs[scriptHash] = { actionName, subActions: [] }
    this.saveCache()
  }

  /**
   * Add tx cache info
   * @param scriptHash hash of script (currently script file name)
   * @param txHash Transaction hash
   * @param info Partial of InfinitCliCacheTxInfo without createdAt and updatedAt
   */
  public addTxCache(scriptHash: ScriptHash, info: Omit<InfinitCliCacheTxInfo, 'createdAt' | 'updatedAt'>) {
    if (!this.infinitCliCache.txs[scriptHash]) {
      throw new Error(`ScriptHash: Script hash ${scriptHash} not found in cache`)
    }

    const now = new Date()
    this.infinitCliCache.txs[scriptHash].subActions.at(-1)!.txHashes.push({ ...info, createdAt: now, updatedAt: now })

    this.saveCache()
  }

  /**
   * Add tx subAction's cache
   * @param scriptHash hash of script (currently script file name)
   * @param subActionName subAction name
   */
  public addTxSubActionCache(scriptHash: ScriptHash, subActionName: string) {
    if (!this.infinitCliCache.txs[scriptHash]) this.infinitCliCache.txs[scriptHash] = { actionName: undefined, subActions: [] }
    this.infinitCliCache.txs[scriptHash].subActions.push({ subActionName, txHashes: [] })

    this.saveCache()
  }

  /**
   * Set tx cache info
   * @param scriptHash hash of script (currently script file name)
   * @param txHash Transaction hash
   * @param info Partial of InfinitCliCacheTxInfo without createdAt, updatedAt and txHash
   */
  public updateTxCache(scriptHash: ScriptHash, txHash: TxHash, info: Partial<Omit<InfinitCliCacheTxInfo, 'createdAt' | 'updatedAt' | 'txHash'>>) {
    if (!this.infinitCliCache.txs[scriptHash]) return

    const subActionIndex = this.infinitCliCache.txs[scriptHash].subActions.findIndex(({ txHashes }) => txHashes.some((tx) => tx.txHash === txHash))

    if (subActionIndex === -1) {
      throw new Error(`SubActionIndex: Tx hash ${txHash} not found in cache`)
    }

    const txIndex = this.infinitCliCache.txs[scriptHash].subActions[subActionIndex].txHashes.findIndex((tx) => tx.txHash === txHash)
    if (txIndex === -1) {
      throw new Error(`Tx hash ${txHash} not found in cache`)
    }

    const txHashInfo = this.infinitCliCache.txs[scriptHash].subActions[subActionIndex].txHashes[txIndex]
    this.infinitCliCache.txs[scriptHash].subActions[subActionIndex].txHashes[txIndex] = {
      ...txHashInfo,
      ...info,
      updatedAt: new Date(),
      txHash,
    }
    this.saveCache()
  }

  /**
   * Delete specific tx cache
   * @param scriptHash hash of script (currently script file name)
   * @param txHash transaction hash
   */
  public deleteTxCache(scriptHash: ScriptHash, txHash: TxHash) {
    if (!this.infinitCliCache.txs[scriptHash]) return

    const subActionIndex = this.infinitCliCache.txs[scriptHash].subActions.findIndex(({ txHashes }) => txHashes.some((tx) => tx.txHash === txHash))
    if (subActionIndex === -1) {
      throw new Error(`SubActionIndex: Tx hash ${txHash} not found in cache`)
    }

    const txIndex = this.infinitCliCache.txs[scriptHash].subActions[subActionIndex].txHashes.findIndex((tx) => tx.txHash === txHash)
    if (txIndex === -1) {
      throw new Error(`Tx hash ${txHash} not found in cache`)
    }

    this.infinitCliCache.txs[scriptHash].subActions[subActionIndex].txHashes.splice(txIndex, 1)
    this.saveCache()
  }

  /**
   * Delete all tx cache
   * @param scriptHash hash of script (currently script file name)
   */
  public deleteTxActionCache(scriptHash: ScriptHash) {
    if (this.infinitCliCache.txs[scriptHash]) {
      delete this.infinitCliCache.txs[scriptHash]
    }

    this.saveCache()
  }

  /**
   * Delete specific subAction's cache
   * @param scriptHash hash of script (currently script file name)
   * @param subActionName subAction name
   */
  public deleteTxSubActionCache(scriptHash: ScriptHash, subActionName: string) {
    if (!this.infinitCliCache.txs[scriptHash]) return

    const subActionIndex = this.infinitCliCache.txs[scriptHash].subActions.findIndex(({ subActionName }) => subActionName === subActionName)
    if (subActionIndex === -1) {
      throw new Error(`SubActionIndex: Sub action ${subActionName} not found in cache`)
    }

    this.infinitCliCache.txs[scriptHash].subActions.splice(subActionIndex, 1)
    this.saveCache()
  }
}

const cache = new Cache()

export { cache, Cache }
