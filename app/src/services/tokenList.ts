export interface TokenInfo {
  id: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

const TOKEN_LIST_URLS: Record<string, string> = {
  mainnet: 'https://raw.githubusercontent.com/alephium/token-list/master/tokens/mainnet.json',
  testnet: 'https://raw.githubusercontent.com/alephium/token-list/master/tokens/testnet.json',
}

let cachedTokens: TokenInfo[] | null = null

export async function fetchTokenList(): Promise<TokenInfo[]> {
  if (cachedTokens) return cachedTokens

  const network = process.env.NEXT_PUBLIC_NETWORK ?? 'devnet'
  const url = TOKEN_LIST_URLS[network]
  if (!url) return [ALPH_TOKEN]

  try {
    const res = await fetch(url)
    const data = await res.json()
    const fetched = (data.tokens as TokenInfo[]).map(t => ({
      id: t.id,
      name: t.name,
      symbol: t.symbol,
      decimals: t.decimals,
      logoURI: t.logoURI,
    }))
    // Always include ALPH at the front if not already in the list
    const hasAlph = fetched.some(t => t.id === ALPH_TOKEN.id)
    cachedTokens = hasAlph ? fetched : [ALPH_TOKEN, ...fetched]
    return cachedTokens
  } catch {
    // Fallback: return just ALPH
    return [ALPH_TOKEN]
  }
}

export const ALPH_TOKEN: TokenInfo = {
  id: '0000000000000000000000000000000000000000000000000000000000000000',
  name: 'Alephium',
  symbol: 'ALPH',
  decimals: 18,
  logoURI: 'https://raw.githubusercontent.com/alephium/token-list/master/logos/ALPH.png',
}

export function findTokenById(tokens: TokenInfo[], id: string): TokenInfo | undefined {
  return tokens.find(t => t.id === id)
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  if (decimals === 0) return amount.toString()

  const divisor = 10n ** BigInt(decimals)
  const whole = amount / divisor
  const remainder = amount % divisor

  if (remainder === 0n) return whole.toString()

  const fracStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${whole}.${fracStr}`
}
