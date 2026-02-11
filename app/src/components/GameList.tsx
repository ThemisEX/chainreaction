'use client'

import React, { FC, useState } from 'react'
import Link from 'next/link'
import { GameListItem } from '@/hooks/useGameList'
import { formatTokenAmount } from '@/services/tokenList'
import { shortenAddress } from '@/services/game.service'

const PAGE_SIZE = 16

function formatDuration(ms: bigint): string {
  const totalSec = Number(ms) / 1000
  if (totalSec < 60) return `${totalSec}s`
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`
}

function getTimeRemaining(endTimestamp: bigint): string {
  const remaining = Number(endTimestamp) - Date.now()
  if (remaining <= 0) return 'Ended'
  const totalSec = Math.ceil(remaining / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m left`
  if (m > 0) return `${m}m ${s}s left`
  return `${s}s left`
}

function getStatus(game: GameListItem): { label: string; color: string } {
  if (!game.state) return { label: 'Unknown', color: 'text-gray-400 bg-gray-50' }
  if (!game.state.isActive) return { label: 'Waiting', color: 'text-blue-600 bg-blue-50' }
  if (game.state.canEnd || Date.now() >= Number(game.state.endTimestamp)) {
    return { label: 'Claimable', color: 'text-amber-600 bg-amber-50' }
  }
  return { label: 'Active', color: 'text-emerald-600 bg-emerald-50' }
}

export const GameList: FC<{ games: GameListItem[]; isLoading: boolean }> = ({ games, isLoading }) => {
  const [page, setPage] = useState(0)

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center gap-3 py-8">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading games...</p>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-gray-400 text-lg">No games yet</p>
        <p className="text-gray-300 text-sm mt-1">Create the first one!</p>
      </div>
    )
  }

  const totalPages = Math.ceil(games.length / PAGE_SIZE)
  const paged = games.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {paged.map((game) => {
          const status = getStatus(game)
          const isActive = game.state?.isActive ?? false
          const token = game.tokenInfo

          return (
            <Link
              key={game.contractId}
              href={`/game?address=${game.address}`}
              className="group flex flex-col p-4 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">#{game.gameId}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-emerald-500 transition-colors">
                  &rarr;
                </span>
              </div>

              {game.state && (
                <div className="flex flex-col gap-1 text-xs flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    {token.logoURI && (
                      <img src={token.logoURI} alt={token.symbol} className="w-4 h-4 rounded-full" />
                    )}
                    <span className="text-gray-600 font-medium">{token.symbol}</span>
                  </div>

                  {isActive && (
                    <>
                      <div className="text-gray-400">
                        Pot: <span className="text-gray-700 font-medium">{formatTokenAmount(game.state.pot + game.state.boostAmount, token.decimals)}</span>
                      </div>
                      <div className="text-gray-400">
                        Entry: <span className="text-gray-700 font-medium">{formatTokenAmount(game.state.nextEntryPrice, token.decimals)}</span>
                      </div>
                      <div className="text-gray-400">
                        Players: <span className="text-gray-700 font-medium">{game.state.playerCount.toString()}</span>
                      </div>
                      <div className="text-gray-400">
                        {getTimeRemaining(game.state.endTimestamp)}
                      </div>
                    </>
                  )}
                  <div className="text-gray-400">
                    Decrease: <span className="text-gray-700">{formatDuration(game.state.durationDecreaseMs)}/player</span>
                  </div>
                  <div className="text-gray-400">
                    Min: <span className="text-gray-700">{formatDuration(game.state.minDuration)}</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-300 mt-2 truncate">{shortenAddress(game.address)}</p>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-gray-400">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
