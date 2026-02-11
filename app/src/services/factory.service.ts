import { SignerProvider, MINIMAL_CONTRACT_DEPOSIT, DUST_AMOUNT } from '@alephium/web3'
import { FactoryChainReactionInstance } from 'my-contracts'

export async function createNewGame(
  factory: FactoryChainReactionInstance,
  signer: SignerProvider,
  durationDecreaseMs: bigint,
  minDuration: bigint
): Promise<{ txId: string }> {
  const result = await factory.transact.createNewGame({
    signer,
    args: { durationDecreaseMsGame: durationDecreaseMs, minDurationGame: minDuration },
    attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
  })
  return { txId: result.txId }
}
