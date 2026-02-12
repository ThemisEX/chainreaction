'use client'

import { FC, useMemo, useRef, useEffect, useState } from 'react'
import { PlayerEntry } from '@/hooks/useChainReaction'
import { formatTokenAmount } from '@/services/tokenList'

interface ActivityFeedProps {
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

export const ActivityFeed: FC<ActivityFeedProps> = ({
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

  const visible = expanded ? sorted : sorted.slice(0, INITIAL_VISIBLE)
  const hasMore = sorted.length > INITIAL_VISIBLE
  const totalPlayers = Number(playerCount)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = 0
  }, [players.length])

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Live Activity</span>
        <span className="text-[10px] text-gray-400 tabular-nums">{totalPlayers} player{totalPlayers !== 1 ? 's' : ''}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {visible.length === 0 && (
          <p className="text-sm text-gray-300 py-8 text-center">Waiting for players...</p>
        )}

        <div className="flex flex-col">
          {visible.map((player, i) => {
            const price = computePrice(baseEntry, multiplierBps, player.position)
            const isLatest = i === 0
            const isYou = currentUserAddress && player.address.toLowerCase() === currentUserAddress.toLowerCase()

            return (
              <div
                key={`${player.position}-${player.address}`}
                className={`flex items-center gap-2.5 px-3 py-2 border-b border-gray-50 transition-colors ${
                  isLatest ? 'bg-emerald-50/60' : 'hover:bg-gray-50/50'
                }`}
              >
                {/* Position badge */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isLatest
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {player.position}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-medium truncate ${isYou ? 'text-emerald-600' : 'text-gray-700'}`}>
                      {shortenAddr(player.address)}
                    </span>
                    {isYou && (
                      <span className="text-[9px] font-medium text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded">you</span>
                    )}
                    {isLatest && (
                      <span className="relative flex h-2 w-2 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    bid #{player.position}
                  </span>
                </div>

                {/* Price */}
                <span className={`flex-shrink-0 text-[11px] font-semibold tabular-nums ${
                  isLatest ? 'text-emerald-600' : 'text-gray-500'
                }`}>
                  {formatTokenAmount(price, tokenDecimals)} {tokenSymbol}
                </span>
              </div>
            )
          })}
        </div>

        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full text-[11px] text-gray-400 hover:text-emerald-500 text-center py-2.5 border-t border-gray-50 transition-colors"
          >
            Show {sorted.length - INITIAL_VISIBLE} more
          </button>
        )}
        {expanded && hasMore && (
          <button
            onClick={() => setExpanded(false)}
            className="w-full text-[11px] text-gray-400 hover:text-emerald-500 text-center py-2.5 border-t border-gray-50 transition-colors"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  )
}
