import type { Hex } from 'viem'
import { z } from 'zod'
import { TX_STATUS } from './Cache.enum'

/**
 * Cache Example
 *
 * {
 *  txs: {
 *    'action-file-01.ts': {
 *      actionName: 'action-name-01',
 *      subActions: [
 *        {
 *          subActionName: 'sub-action-name-01',
 *          txHashes: [
 *            { txHash: '0x001', txBuilderName: 'tx-builder-name-01', status: TX_STATUS.PENDING, createdAt: new Date(), updatedAt: new Date() },
 *            { txHash: '0x002', txBuilderName: 'tx-builder-name-02', status: TX_STATUS.CONFIRMED, createdAt: new Date(), updatedAt: new Date() },
 *          ],
 *        },
 *      ],
 *    },
 *  },
 *}
 */

/**
 * Action Hash
 */

export const ScriptHashZod = z.string()
export type ScriptHash = z.infer<typeof ScriptHashZod>

/**
 * TxHash
 */

export const TxHashZod = z.custom<Hex>((value) => {
  if (value.length !== 66) {
    return { success: false, message: 'TxHash length must be 66' }
  }
  return { success: true, data: value }
})

export type TxHash = z.infer<typeof TxHashZod>

/**
 * InfinitCliCacheTxInfo
 */

export const InfinitCliCacheTxInfoZod = z.object({
  txHash: TxHashZod,
  txBuilderName: z.string(),
  status: z.nativeEnum(TX_STATUS),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type InfinitCliCacheTxInfo = z.infer<typeof InfinitCliCacheTxInfoZod>

/**
 * InfinitCliCacheTxSubAction
 */

export const InfinitCliCacheTxSubActionZod = z.object({
  subActionName: z.string(),
  txHashes: z.array(InfinitCliCacheTxInfoZod),
})

export type InfinitCliCacheTxSubAction = z.infer<typeof InfinitCliCacheTxSubActionZod>

/**
 * InfinitCliCacheTxAction
 */

export const InfinitCliCacheTxActionZod = z.object({
  actionName: z.string().optional(),
  subActions: z.array(InfinitCliCacheTxSubActionZod),
})

export type InfinitCliCacheTxAction = z.infer<typeof InfinitCliCacheTxActionZod>

/**
 * InfinitCliCache
 */

export const TxHashArrayZod = z.array(InfinitCliCacheTxInfoZod)

export const InfinitCliCacheZod = z.object({
  txs: z.record(ScriptHashZod, InfinitCliCacheTxActionZod).default({}),
})

export type InfinitCliCache = z.infer<typeof InfinitCliCacheZod>

/**
 * Type for reviver function in JSON.parse
 * example:
 */
// biome-ignore lint/complexity/noUselessTypeConstraint: <explanation>
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type JsonReviver<T extends any> = (this: any, key: string, value: any) => T
