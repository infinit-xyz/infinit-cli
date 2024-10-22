import { Action, type InfinitWallet, SubAction } from '@infinit-xyz/core'
import { zodAddressNonZero } from '@infinit-xyz/core/internal'
import { z } from 'zod'

export type MockActionData = {
  params: object
  signer: Record<'deployer', InfinitWallet>
}

type MockRegistry = object

export const SetFeeProtocolActionParamsSchema = z.object({
  param1: zodAddressNonZero.describe('Address'),
})

export class MockAction extends Action<MockActionData, MockRegistry> {
  constructor(data: MockActionData) {
    super(MockAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    return []
  }

  public override async run(registry: object): Promise<object> {
    return registry
  }
}
