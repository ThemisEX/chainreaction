'use client'

import { FC, useMemo, useRef, useEffect, useState } from 'react'
import { PlayerEntry } from '@/hooks/useChainReaction'
import { formatTokenAmount } from '@/services/tokenList'

interface PlayerTrailProps {
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

const INITIAL_VISIBLE = 15

export const PlayerTrail: FC<PlayerTrailProps> = ({
  players,
  baseEntry,
  multiplierBps,
  tokenSymbol,
  tokenDecimals,
  currentUserAddress,
  playerCount,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)

  const sorted = useMemo(
    () => [...players].sort((a, b) => b.position - a.position),
    [players]
  )

  const totalPlayers = Number(playerCount)
  const maxPrice = sorted.length > 0
    ? computePrice(baseEntry, multiplierBps, sorted[0].position)
    : baseEntry

  const displayPlayers = expanded ? sorted : sorted.slice(0, INITIAL_VISIBLE)
  const hasMore = sorted.length > INITIAL_VISIBLE
  const hiddenCount = sorted.length - INITIAL_VISIBLE

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = 0
  }, [players.length])

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Chain</span>
        <span className="text-[10px] text-gray-400 tabular-nums">{totalPlayers} player{totalPlayers !== 1 ? 's' : ''}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {sorted.length === 0 && (
          <p className="text-sm text-gray-300 py-8 text-center">Waiting for players...</p>
        )}

        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full text-[11px] text-gray-400 hover:text-emerald-500 text-center py-2 border-b border-gray-50 transition-colors"
          >
            Show {hiddenCount} more
          </button>
        )}

        <div className="flex flex-col items-center py-3 px-3">
          {displayPlayers.map((player, i) => {
            const price = computePrice(baseEntry, multiplierBps, player.position)
            const ratio = Number(price * 1000n / maxPrice) / 1000
            const isLast = player.position === sorted[0]?.position
            const isYou = currentUserAddress && player.address.toLowerCase() === currentUserAddress.toLowerCase()

            // Node size: 24px min → 40px max based on bid ratio
            const nodeSize = Math.round(24 + ratio * 16)
            // Link thickness: 2px → 5px
            const linkThickness = Math.round(2 + ratio * 3)
            // Link height proportional to price jump
            const linkHeight = Math.round(8 + ratio * 12)

            return (
              <div key={`${player.position}-${player.address}`} className="flex flex-col items-center">
                {/* Connector link (not for first) */}
                {i > 0 && (
                  <div
                    className="rounded-full"
                    style={{
                      width: `${linkThickness}px`,
                      height: `${linkHeight}px`,
                      backgroundColor: isLast
                        ? '#10b981'
                        : `hsl(${155 + ratio * 15}, ${20 + ratio * 45}%, ${78 - ratio * 20}%)`,
                    }}
                  />
                )}

                {/* Node */}
                <div className="group relative flex items-center justify-center">
                  {/* Crown for last player */}
                  {isLast && (
                    <span className="absolute -top-3.5 text-[11px] leading-none select-none">
                      &#x1F451;
                    </span>
                  )}

                  <div
                    className={`rounded-full flex items-center justify-center transition-all ${
                      isLast
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300'
                        : isYou
                          ? 'ring-2 ring-emerald-400'
                          : ''
                    }`}
                    style={{
                      width: `${nodeSize}px`,
                      height: `${nodeSize}px`,
                      ...(!isLast ? {
                        backgroundColor: `hsl(${155 + ratio * 15}, ${25 + ratio * 40}%, ${82 - ratio * 25}%)`,
                      } : {}),
                    }}
                  >
                    <span className={`text-[9px] font-bold ${isLast ? 'text-white' : 'text-gray-600'}`}>
                      {player.position}
                    </span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap bg-gray-900 text-white text-[10px] rounded-md px-2 py-1 shadow-lg">
                    <span className="font-bold">#{player.position}</span>
                    {' '}{shortenAddr(player.address)}
                    {isYou && <span className="text-emerald-300 ml-1">(you)</span>}
                    {' — '}
                    <span className="font-bold">{formatTokenAmount(price, tokenDecimals)} {tokenSymbol}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {expanded && hasMore && (
          <button
            onClick={() => setExpanded(false)}
            className="w-full text-[11px] text-gray-400 hover:text-emerald-500 text-center py-2 border-t border-gray-50 transition-colors"
          >
            Show less
          </button>
        )}
      </div>

      {/* Leader summary at bottom */}
      {sorted.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-100 text-center">
          <div className="text-[10px] font-bold text-emerald-600 tabular-nums">
            {formatTokenAmount(computePrice(baseEntry, multiplierBps, sorted[0].position), tokenDecimals)} {tokenSymbol}
          </div>
          <div className="text-[10px] text-gray-400">
            {shortenAddr(sorted[0].address)}
          </div>
        </div>
      )}
    </div>
  )
}
