import type { Address } from 'viem'

/**
 * From @ethereumjs/wallet
 */

type PBKDFParamsOut = {
  c: number
  dklen: number
  prf: string
  salt: string
}

type ScryptKDFParamsOut = {
  dklen: number
  n: number
  p: number
  r: number
  salt: string
}
type KDFParamsOut = ScryptKDFParamsOut | PBKDFParamsOut

export type KeystoreV3 = {
  crypto: {
    cipher: string
    cipherparams: {
      iv: string
    }
    ciphertext: string
    kdf: string
    kdfparams: KDFParamsOut
    mac: string
  }
  id: string
  version: number
  address: Address
}
