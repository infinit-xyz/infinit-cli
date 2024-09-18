import { SetFactorAction } from './setFactorAction'

const action = new SetFactorAction(
  '0xpooladdress', // pooladdress
  0, // factor
)

export default [
  {
    action: action,
    accountId: '123',
  },
]
