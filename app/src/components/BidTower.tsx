'use client'

import { FC, useMemo, useRef, useEffect } from 'react'
import { PlayerEntry } from '@/hooks/useChainReaction'
import { formatTokenAmount } from '@/services/tokenList'

interface BidTowerProps {
  players: PlayerEntry[]
  baseEntry: bigint
  multiplierBps: bigint
  tokenSymbol: string
  tokenDecimals: number
  currentUserAddress?: string
  playerCount: bigint
}

function computePrice(baseEntry: bigint, multiplierBps: bigint, position: number): bigint {
  let price = baseEntry
  for (let i = 1; i < position; i++) {
    price = price + (price * multiplierBps) / 10000n
  }
  return price
}

function shortenAddr(addr: string): string {
  if (addr.length <= 10) return addr
  return `${addr.slice(0, 5)}...${addr.slice(-4)}`
}

const MAX_VISIBLE = 20

export const BidTower: FC<BidTowerProps> = ({
  players,
  baseEntry,
  multiplierBps,
  tokenSymbol,
  tokenDecimals,
  currentUserAddress,
  playerCount,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const sorted = useMemo(
    () => [...players].sort((a, b) => a.position - b.position),
    [players]
  )

  const visible = sorted.length > MAX_VISIBLE ? sorted.slice(-MAX_VISIBLE) : sorted
  const hiddenCount = sorted.length - visible.length

  const maxPrice = visible.length > 0
    ? computePrice(baseEntry, multiplierBps, visible[visible.length - 1].position)
    : baseEntry

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [players.length])

  const totalPlayers = Number(playerCount)

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Bid Tower</span>
        <span className="text-[10px] text-gray-400 tabular-nums">{totalPlayers} player{totalPlayers !== 1 ? 's' : ''}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 flex flex-col justify-end">
        <div className="flex flex-col items-center gap-[3px] p-3">
          {hiddenCount > 0 && (
            <div className="text-[10px] text-gray-300 py-1 mb-1">
              +{hiddenCount} below
            </div>
          )}

          {visible.length === 0 && (
            <p className="text-sm text-gray-300 py-8">Waiting for players...</p>
          )}

          {visible.map((player, i) => {
            const price = computePrice(baseEntry, multiplierBps, player.position)
            const ratio = Number(price * 1000n / maxPrice) / 1000
            const widthPct = 30 + ratio * 70
            const isTop = i === visible.length - 1
            const isYou = currentUserAddress && player.address.toLowerCase() === currentUserAddress.toLowerCase()

            // Color: cool gray at bottom → emerald at top
            const t = visible.length > 1 ? i / (visible.length - 1) : 1
            const h = Math.round(12 + t * 6) // block height 12px → 18px

            return (
              <div
                key={`${player.position}-${player.address}`}
                className="group relative flex justify-center"
                style={{ width: `${widthPct}%`, alignSelf: 'center' }}
              >
                {/* The block */}
                <div
                  className={`
                    w-full rounded-sm transition-all relative
                    ${isTop
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                      : isYou
                        ? 'ring-1 ring-emerald-400'
                        : ''
                    }
                  `}
                  style={{
                    height: `${h}px`,
                    ...(!isTop ? {
                      backgroundColor: `hsl(${155 + t * 15}, ${20 + t * 45}%, ${88 - t * 25}%)`,
                    } : {}),
                  }}
                />

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap bg-gray-900 text-white text-[10px] rounded-md px-2 py-1 shadow-lg">
                  <span className="font-bold">#{player.position}</span>
                  {' '}{shortenAddr(player.address)}
                  {isYou && <span className="text-emerald-300 ml-1">(you)</span>}
                  {' — '}
                  <span className="font-bold">{formatTokenAmount(price, tokenDecimals)} {tokenSymbol}</span>
                </div>
              </div>
            )
          })}

          {/* Crown / leader label on top */}
          {visible.length > 0 && (
            <div className="text-[10px] font-bold text-emerald-600 mt-1 tabular-nums">
              {formatTokenAmount(computePrice(baseEntry, multiplierBps, visible[visible.length - 1].position), tokenDecimals)} {tokenSymbol}
              <span className="text-gray-400 font-normal ml-1.5">
                #{visible[visible.length - 1].position} {shortenAddr(visible[visible.length - 1].address)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
