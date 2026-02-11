'use client'

import React, { useRef, useCallback, useMemo } from 'react'
import { ChainReactionV1 } from 'my-contracts'
import { NavBar } from './NavBar'
import { GameBoard } from './GameBoard'
import { GameList } from './GameList'
import { CreateGame } from './CreateGame'
import { useGameList } from '@/hooks/useGameList'
import { gameConfig } from '@/services/utils'

export default function Home() {
  const connectRef = useRef<HTMLDivElement>(null)
  const gamesRef = useRef<HTMLDivElement>(null)
  const { games, isLoading, error } = useGameList(gameConfig.factoryInstance)

  const openConnect = useCallback(() => {
    const btn = connectRef.current?.querySelector('button')
    btn?.click()
  }, [])

  const v1Instance = useMemo(
    () => gameConfig.v1Address ? ChainReactionV1.at(gameConfig.v1Address) : null,
    []
  )

  const scrollToGames = () => {
    gamesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      <NavBar ref={connectRef} />
      <main className="flex-1 flex flex-col items-center w-full">

        {v1Instance && (
          <GameBoard contractInstance={v1Instance} onConnectRequest={openConnect} onBrowseGames={scrollToGames} />
        )}

        <div ref={gamesRef} className="w-full max-w-6xl px-4 py-8 flex flex-col items-center gap-5">
          <h2 className="text-xl font-bold text-gray-900">All Games</h2>

          <CreateGame
            factory={gameConfig.factoryInstance}
            onConnectRequest={openConnect}
          />

          {error && (
            <p className="w-full text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <GameList games={games} isLoading={isLoading} />

          <p className="text-xs text-gray-400 mt-4">
            Built by{' '}
            <a href="https://notrustverify.ch" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 underline">
              No Trust Verify
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
