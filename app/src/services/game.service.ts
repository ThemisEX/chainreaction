import { SignerProvider, ALPH_TOKEN_ID, prettifyAttoAlphAmount, DUST_AMOUNT, ONE_ALPH, MINIMAL_CONTRACT_DEPOSIT, web3 } from '@alephium/web3'
import { ChainReactionInstance, ChainReactionV1Instance } from 'my-contracts'

export type GameContractInstance = ChainReactionInstance | ChainReactionV1Instance

export interface GameState {
  chainId: bigint
  currentEntry: bigint
  lastPlayer: string
  lastEntryTimestamp: bigint
  pot: bigint
  boostAmount: bigint
  isActive: boolean
  playerCount: bigint
  nextEntryPrice: bigint
  canEnd: boolean
  endTimestamp: bigint
  baseEntry: bigint
  multiplierBps: bigint
  durationMs: bigint
  durationDecreaseMs: bigint
  minDuration: bigint
  tokenId: string
  burnBps: bigint
  burnedAmount: bigint
}

function isAlph(tokenId: string): boolean {
  return !tokenId || tokenId === ALPH_TOKEN_ID || /^0+$/.test(tokenId)
}

function buildTxParams(tokenId: string, payment: bigint) {
  if (isAlph(tokenId)) {
    return { attoAlphAmount: payment + 5n*DUST_AMOUNT }
  }
  return {
    attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
    tokens: [{ id: tokenId, amount: payment }],
  }
}

export async function fetchGameState(contract: GameContractInstance): Promise<GameState> {
  try {
    const state = await contract.fetchState()
    const fields = state.fields

    const nextEntryPriceResult = await contract.view.getNextEntryPrice()
    const canEndResult = await contract.view.canEnd()

    return {
      chainId: fields.chainId,
      currentEntry: fields.currentEntry,
      lastPlayer: fields.lastPlayer,
      lastEntryTimestamp: fields.lastEntryTimestamp,
      pot: fields.pot,
      boostAmount: fields.boostAmount,
      isActive: fields.isActive,
      playerCount: fields.playerCount,
      nextEntryPrice: nextEntryPriceResult.returns,
      canEnd: canEndResult.returns,
      endTimestamp: fields.endTimestamp,
      baseEntry: fields.baseEntry,
      multiplierBps: fields.multiplierBps,
      durationMs: fields.durationMs,
      durationDecreaseMs: fields.durationDecreaseMs,
      minDuration: fields.minDuration,
      tokenId: fields.tokenId,
      burnBps: fields.burnBps,
      burnedAmount: fields.burnedAmount,
    }
  } catch {
    // Fall back to raw API for v1 contracts with different ABI
    return fetchV1GameState(contract.address)
  }
}

// Fetch state for v1 contracts (different ABI - no factoryId immutable field)
// Uses raw node API to bypass typed ABI mismatch
export async function fetchV1GameState(address: string): Promise<GameState> {
  const provider = web3.getCurrentNodeProvider()
  const state = await provider.contracts.getContractsAddressState(address)
  const mut = state.mutFields
  const imm = state.immFields

  // V1 mutable fields order: chainId, currentEntry, lastPlayer, lastEntryTimestamp,
  // pot, boostAmount, playerCount, isActive, baseEntry, endTimestamp,
  // durationMs, multiplierBps, tokenId, burnBps, burnedAmount
  const chainId = BigInt(mut[0].value as string)
  const currentEntry = BigInt(mut[1].value as string)
  const lastPlayer = mut[2].value as string
  const lastEntryTimestamp = BigInt(mut[3].value as string)
  const pot = BigInt(mut[4].value as string)
  const boostAmount = BigInt(mut[5].value as string)
  const playerCount = BigInt(mut[6].value as string)
  const isActive = mut[7].value as boolean
  const baseEntry = BigInt(mut[8].value as string)
  const endTimestamp = BigInt(mut[9].value as string)
  const durationMs = BigInt(mut[10].value as string)
  const multiplierBps = BigInt(mut[11].value as string)
  const tokenId = mut[12].value as string
  const burnBps = BigInt(mut[13].value as string)
  const burnedAmount = BigInt(mut[14].value as string)

  // V1 immutable fields: durationDecreaseMs, minDuration
  const durationDecreaseMs = BigInt(imm[0].value as string)
  const minDuration = BigInt(imm[1].value as string)

  // Compute derived values locally
  const nextEntryPrice = !isActive ? baseEntry : currentEntry + (currentEntry * multiplierBps / 10000n)
  const canEnd = isActive && BigInt(Date.now()) >= endTimestamp

  return {
    chainId, currentEntry, lastPlayer, lastEntryTimestamp,
    pot, boostAmount, isActive, playerCount, nextEntryPrice,
    canEnd, endTimestamp, baseEntry, multiplierBps,
    durationMs, durationDecreaseMs, minDuration, tokenId,
    burnBps, burnedAmount,
  }
}

export async function startChain(
  contract: GameContractInstance,
  signer: SignerProvider,
  payment: bigint,
  durationMs: bigint,
  multiplierBps: bigint,
  tokenId: string,
  burnRate: bigint
): Promise<{ txId: string }> {
  const result = await contract.transact.startChain({
    signer,
    args: { payment, durationGameMs: durationMs, multiplierGameBps: multiplierBps, tokenIdGame: tokenId, burnRate },
    ...buildTxParams(tokenId, payment),
  })
  return { txId: result.txId }
}

export async function joinChain(
  contract: GameContractInstance,
  signer: SignerProvider,
  payment: bigint,
  tokenId: string
): Promise<{ txId: string }> {
  const result = await contract.transact.joinChain({
    signer,
    args: { payment },
    ...buildTxParams(tokenId, payment),
  })
  return { txId: result.txId }
}

export async function endChain(
  contract: GameContractInstance,
  signer: SignerProvider,
  tokenId: string
): Promise<{ txId: string }> {
  const result = await contract.transact.endChain({
    signer,
    attoAlphAmount: isAlph(tokenId) ? 5n*DUST_AMOUNT : 5n*DUST_AMOUNT,
  })
  return { txId: result.txId }
}

export async function incentivize(
  contract: GameContractInstance,
  signer: SignerProvider,
  amount: bigint,
  tokenId: string
): Promise<{ txId: string }> {
  const result = await contract.transact.incentive({
    signer,
    args: { amount },
    ...buildTxParams(tokenId, amount),
  })
  return { txId: result.txId }
}

export function formatAlph(attoAlph: bigint): string {
  return prettifyAttoAlphAmount(attoAlph) ?? '0'
}

export function normalizeAddress(address: string): string {
  const idx = address.indexOf(':')
  return idx >= 0 ? address.slice(0, idx) : address
}

export function shortenAddress(address: string): string {
  const clean = normalizeAddress(address)
  if (clean.length <= 12) return clean
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`
}
