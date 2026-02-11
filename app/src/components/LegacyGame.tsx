'use client'

import React, { FC, useMemo } from 'react'
import Link from 'next/link'
import { ChainReaction } from 'my-contracts'
import { useChainReaction } from '@/hooks/useChainReaction'
import { formatTokenAmount } from '@/services/tokenList'
import { shortenAddress } from '@/services/game.service'

export const LegacyGame: FC<{ address: string }> = ({ address }) => {
  const contractInstance = useMemo(() => ChainReaction.at(address), [address])
  const { gameState, isLoading } = useChainReaction(contractInstance)

  // Hide if loaded and no active game
  if (!isLoading && (!gameState || !gameState.isActive)) return null

  return (
    <Link
      href={`/game?address=${address}`}
      className="group w-full p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">Legacy Game (v1)</span>
          {isLoading ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-gray-400 bg-gray-100">
              Loading...
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50">
              Active
            </span>
          )}
        </div>
        <span className="text-xs text-gray-300 group-hover:text-amber-500 transition-colors">
          Play &rarr;
        </span>
      </div>

      {gameState && gameState.isActive && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="text-gray-400">
            Pot: <span className="text-gray-700 font-medium">{formatTokenAmount(gameState.pot + gameState.boostAmount, 18)} ALPH</span>
          </div>
          <div className="text-gray-400">
            Players: <span className="text-gray-700 font-medium">{gameState.playerCount.toString()}</span>
          </div>
          <div className="text-gray-400">
            Entry: <span className="text-gray-700 font-medium">{formatTokenAmount(gameState.nextEntryPrice, 18)} ALPH</span>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-300 mt-2 truncate">{shortenAddress(address)}</p>
    </Link>
  )
}
